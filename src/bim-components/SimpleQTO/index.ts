import * as WEBIFC from "web-ifc"
import * as OBC from "@thatopen/components"
import * as FRAGS from "@thatopen/fragments"
import { getModelUnit } from "./src/get-model-unit"

type QtoResult = {
    [setName: string]: {
        [name: string]: {
            value: number;
            unit: string;
        };
    };
}
export class SimpleQto extends OBC.Component implements OBC.Disposable {
    static uuid = "e7416aa4-3afe-487c-b349-1e1964b29265"
    enabled = true
    onDisposed: OBC.Event<any>
    private _qtoResult: QtoResult = {}

    constructor(components: OBC.Components) {
        super(components)
        this.components.add(SimpleQto.uuid, this)

    }
    resetQuantities() {
        this._qtoResult = {}
    }
    /*
    async sumQuantities(fragmentIdMap){
        console.time("QTO")
        const fragmentManager = this.components.get(OBC.FragmentsManager)
        const modelIdMap = fragmentManager.getModelIdMap(fragmentIdMap)
        for (const modelId in modelIdMap) {
            const model = fragmentManager.groups.get(modelId)
            if (!model) continue
        
            if (!model.hasProperties) { return }
            await OBC.IfcPropertiesUtils.getRelationMap(
                model,
                WEBIFC.IFCRELDEFINESBYPROPERTIES,
                async (setID, relatedIDs) => {
                    const set = await model.getProperties(setID)
                    const expressIDs = modelIdMap[modelId]
                    const workingIDs = relatedIDs.filter(id => expressIDs.has(id))
                    const { name: setName } = await OBC.IfcPropertiesUtils.getEntityName(model, setID)
                    if (set?.type !== WEBIFC.IFCELEMENTQUANTITY || workingIDs.length === 0 || !setName) { return }
                    if (!(setName in this._qtoResult)) { this._qtoResult[setName] = {} }
                    await OBC.IfcPropertiesUtils.getQsetQuantities(
                        model,
                        setID,
                        async (qtoID) => {
                            const { name: qtoName } = await OBC.IfcPropertiesUtils.getEntityName(model, qtoID)
                            const { value } = await OBC.IfcPropertiesUtils.getQuantityValue(model, qtoID)
                            if (!qtoName || !value) { return }
                            if (!(qtoName in this._qtoResult[setName])) { this._qtoResult[setName][qtoName] = 0 }
                            this._qtoResult[setName][qtoName] += value
                        }
                    )
                }
            )
        }
        console.log(this._qtoResult)
        console.timeEnd("QTO")
        
        }
        */
        async sumQuantities(fragmentIdMap: FRAGS.FragmentIdMap) { // FASTER
            console.time("QTO V2")
            const fragmentManager = this.components.get(OBC.FragmentsManager)
            const modelIdMap = fragmentManager.getModelIdMap(fragmentIdMap)

            this._qtoResult = {}
            const processedIDs = new Set();
            for (const modelId in modelIdMap) {
                const model = fragmentManager.groups.get(modelId)
                if (!model) continue
                if (!model.hasProperties) { return }
                for (const fragmentID in fragmentIdMap) {
                    const expressIDs = fragmentIdMap[fragmentID]
                    const indexer = this.components.get(OBC.IfcRelationsIndexer)
                    for (const id of expressIDs) {
                    const sets = indexer.getEntityRelations(model, id, "IsDefinedBy") || [];
                    if (!sets || sets.length === 0) {
                        console.warn(`No se encontraron conjuntos para ID ${id} en el modelo ${modelId}.`);
                        continue;
                    }
                    
                    for (const expressID of sets) {
                        if (processedIDs.has(expressID)) {
                            continue
                        };
                        processedIDs.add(expressID)
                        const set = await model.getProperties(expressID)
                        const { name: setName } = await OBC.IfcPropertiesUtils.getEntityName(model, expressID)
                        if (set?.type !== WEBIFC.IFCELEMENTQUANTITY || !setName) {
                            continue}
                        if (!(setName in this._qtoResult)) { this._qtoResult[setName] = {} }
                        for (const qtoHandle of set.Quantities){
                            const propAtt = await model.getProperties(qtoHandle.value)
                            if(!propAtt) {
                                continue}
                            const valueKey = Object.keys(propAtt).find((atr)=> atr.toLowerCase().includes("value"))
                            if(!(valueKey && propAtt[valueKey])) {
                                continue}
                            let value = propAtt[valueKey].value
                            let {name} = propAtt[valueKey]
                            const units: Record<string, any> = (await getModelUnit(model, name)) ?? {};
                            let symbol = units.symbol ?? ""
                            const ifcLabelValue  = propAtt.Name.value
                            if (typeof value === "string") {
                                value = parseFloat(value.replace(/[^\d.-]/g, ""));
                            }

                            if (typeof value === "number" && !isNaN(value)) {
                                const digits = typeof units.digits === "number" ? units.digits : 2; 
                                value = Number(value.toFixed(digits)); 
                            } else {
                                value = 0;
                            }
                            console.log(`Final Value: ${ifcLabelValue} ${value} ${symbol}`);

                            if (!(ifcLabelValue in this._qtoResult[setName])) { 
                                this._qtoResult[setName][ifcLabelValue] = {value: 0, unit: symbol} }
                            
                            if (!isNaN(value)){
                                this._qtoResult[setName][ifcLabelValue].value += value
                            } else {
                                console.warn(`Valor no numérico para ${name}: ${propAtt[valueKey].value}`);
                            }
                        }
                        
                        
                        
                        /*await OBC.IfcPropertiesUtils.getQsetQuantities(
                        model,
                        expressID,
                        async (qtoID) => {
                            const { name: qtoName } = await OBC.IfcPropertiesUtils.getEntityName(model, qtoID)
                            const { value } = await OBC.IfcPropertiesUtils.getQuantityValue(model, qtoID)
                            if (!qtoName || value === undefined || value === null)  { 
                                console.warn(`No se pudo obtener un valor para ${qtoID} en el modelo ${modelId}.`);
                                return }
                        
                            if (!(qtoName in this._qtoResult[setName])) { 
                                this._qtoResult[setName][qtoName] =  0 
                            this._qtoResult[setName][qtoName] += value
                        }
                        )
                        */
                    }
                    }
                }
                }
                console.log(this._qtoResult)
                console.timeEnd("QTO V2")
            }


    async dispose() {
        this.enabled = false
        this.resetQuantities()
        this.onDisposed.trigger()
    }
}
