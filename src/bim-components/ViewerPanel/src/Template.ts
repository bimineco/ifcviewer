import * as OBC from "@thatopen/components"
import * as OBCF from "@thatopen/components-front"
import * as BUI from "@thatopen/ui"
import * as FRAGS from "@thatopen/fragments"
import * as THREE from "three"
import { SimpleQto } from "../../SimpleQTO/index.ts"

interface TableRow {
    data: {
        Set: string;
        Propiedad: string;
        Valor: {
            value: number;
            unidad: string;
        };
    };
    children?: TableRow[];
}

export class ViewerPanel extends OBC.Component implements OBC.Disposable{
    static uuid = "d16f17d8-4345-42e8-b6d1-a10f9f4b6799"
    enabled = true
    private _world: OBC.World
    private table: BUI.Table
    private viewerSection: HTMLElement
    private simpleQto: SimpleQto
    private name: string
    private _markers: { [key: string]: any } = {};
    private selectionListener?: (fragmentIdMap: FRAGS.FragmentIdMap) => void;

    onDisposed: OBC.Event<any> = new OBC.Event()
    

    constructor(components: OBC.Components) {
        super(components)
        
        this.components.add(ViewerPanel.uuid, this);
        
        this.simpleQto = new SimpleQto(components)

        this.createTable();
    }

    set world(world: OBC.World) {
        this._world = world
    }

    createTable = () => {
        this.table = BUI.Component.create<BUI.Table>(() => {
            return BUI.html`<bim-table @rowcreated=${this.onRowCreated}></bim-table>`;
        });
    }

    async handleSelection(fragmentIdMap: FRAGS.FragmentIdMap) {
        if (!this.simpleQto) return;

        this.simpleQto.resetQuantities();
        
        await this.simpleQto.sumQuantities(fragmentIdMap);

        this.updateTableData(this.simpleQto["_qtoResult"]);
    }

    highlightQtoItem(data) {
        console.log("Destacando elemento:", data);
    }
    onRowCreated = (event) => {
        event.stopImmediatePropagation()
        const { row } = event.detail;
        const originalColor = row.style.backgroundColor;
        
        row.addEventListener("click", async() => {
            if (!row.data) return

            const setName = row.data.Set || this.name;
            const qtoData = this.simpleQto["_qtoResult"][setName]?.[row.data.Propiedad] || {};

            console.log("Fila seleccionada:", qtoData);

            const qtoDataValues = Object.keys(qtoData).map(key => ({
                propiedad: key,
                valor:  Number(qtoData[key]?.value ?? 0),
                unidad: qtoData[key]?.unit || "",
                set: setName,
                rawData: qtoData[key]
            }));
            console.log(qtoDataValues)
            this.highlightQtoItem(qtoDataValues);
        });
        
        row.addEventListener("mouseover", () => { 
            row.style.backgroundColor = "gray" 
        })
        row.addEventListener("mouseout", () => { 
            row.style.backgroundColor = originalColor;
        })
    }

    formatQtoValue(value: any, unit: string): string {
        let numericValue: number

        if (typeof value === "string") {
            numericValue = parseFloat(value.replace(/[^\d,]/g, ""))
        } else if (typeof value === "number") {
            numericValue = value
        }else{
            return `0.00 ${unit || ""}`;
        }
        if (isNaN(numericValue)) {
            return `0.00 ${unit || ""}`;
        }

        return `${numericValue.toFixed(2)} ${unit || ""}`;
    }

    updateTableData(qtoResult: Record<string, any>) {
        if (!this.enabled || !this.table) return;
    
        console.log("Datos recibidos en updateTableData:", qtoResult);
    
        const tableData: TableRow[] = [];
        const uniqueSetNames = Object.keys(qtoResult);
    
        if (uniqueSetNames.length === 0) {
            console.warn("No hay conjuntos de datos en qtoResult.");
            this.table.data = [];
            return;
        }
    
        for (const setName of uniqueSetNames) {
            const children = Object.entries(qtoResult[setName]).map(([qtoName, data]) => {
                //console.log("Procesando propiedad:", qtoName, "Datos recibidos:", data);
                
                return {
                    data: {
                        Set: setName,
                        Propiedad: qtoName,
                        Valor: this.formatQtoValue(data.value, data.unit),
                    },
                    
                };
            }).filter(Boolean);
            
            if (uniqueSetNames.length === 1) {
                tableData.push(...children);
                this.name = setName;
            } else {
                tableData.push({
                    data: { Set: setName },
                    children,
                });
                const setLabel = uniqueSetNames.join(", "); 
                this.name = setLabel;
            }
        }
    
        this.table.hiddenColumns = uniqueSetNames.length === 1 ? ["Set"] : [];
    
        this.table.data = [];
        setTimeout(() => {
            this.table.data = tableData;
        }, 0);
    
        //console.log("Tabla actualizada:", this.table.data);
    }
    
    addTable(){
        if (!this.enabled) return

        const highlighter = this.components.get(OBCF.Highlighter)

        if (this.selectionListener) {
            highlighter.events.selectEvent.onHighlight.remove(this.selectionListener);
        }

        this.selectionListener = async (fragmentIdMap: FRAGS.FragmentIdMap) => {
            if (!fragmentIdMap || Object.keys(fragmentIdMap).length === 0) return;
            
            await this.handleSelection(fragmentIdMap);
                        
            if (!this._world) {
                throw new Error("No world found")
            }
            const boundingBoxer = this.components.get(OBC.BoundingBoxer)
            boundingBoxer.addFragmentIdMap(fragmentIdMap)
            const { center } = boundingBoxer.getSphere()
            boundingBoxer.reset()

            document.querySelectorAll('.viewerSection').forEach(el => el.remove());
            const viewerSection = BUI.Component.create<HTMLElement>(() => {
                return BUI.html`
                    <bim-panel-section
                        name=${this.name}
                        label=${this.name}
                        class="viewerSection"
                        fixed
                    >
                        ${this.table}
                    </bim-panel-section>
                `;
            });
            this._markers[viewerSection.id]?.dispose();
            const marker = new OBCF.Mark(this._world, viewerSection)
            marker.three.position.copy(center)
            this._markers[viewerSection.id] = marker;
        }
        highlighter.events.selectEvent.onHighlight.add(this.selectionListener);
    }
    removeTable() {
        if (!this.enabled) return;
    
        document.querySelectorAll('.viewerSection').forEach(viewerSection => {
            viewerSection.remove();
    
            const marker = this._markers[viewerSection.id];
            if (marker) {
                marker.dispose();
                delete this._markers[viewerSection.id];
            }
        });
    }

    stopAddingTables() {
        if (!this.selectionListener) return;
    
        const highlighter = this.components.get(OBCF.Highlighter);
    
        highlighter.events.selectEvent.onHighlight.remove(this.selectionListener);

        this.selectionListener = undefined;
    }

    async dispose() {
        this.enabled=false
        if (this.table){
            this.table.data = [];
            this.table.remove();
        }
        
        this.removeTable();
        this.onDisposed.trigger();
    }
}