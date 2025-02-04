import * as WEBIFC from "web-ifc"
import * as OBC from "@thatopen/components"
import * as FRAGS from "@thatopen/fragments"

type QtoResult = {[setName: string]: {[qtoName: string]: number}}
export class SimpleQtO extends OBC.Component implements OBC.Disposable {
    static uuid = "e7416aa4-3afe-487c-b349-1e1964b29265"
    enabled = true
    onDisposed: OBC.Event<any>
    private _qtoResult: QtoResult = {}

    constructor(components: OBC.Components) {
        super(components)
        this.components.add(SimpleQtO.uuid, this)
    }
    resetQuantities() {
        this._qtoResult = {}
    }

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

        async sumQuantitiesV2(fragmentIdMap: FRAGS.FragmentIdMap) { // FASTER
            console.time("QTO V2")
            const fragmentManager = this.components.get(OBC.FragmentsManager)
            const modelIdMap = fragmentManager.getModelIdMap(fragmentIdMap)
            for (const modelId in modelIdMap) {
                const model = fragmentManager.groups.get(modelId)
                if (!model) continue
                if (!model.hasProperties) { return }
                for (const fragmentID in fragmentIdMap) {
                    const expressIDs = fragmentIdMap[fragmentID]
                    const indexer = this.components.get(OBC.IfcRelationsIndexer)
                    for (const id of expressIDs) {
                    const sets = indexer.getEntityRelations(model, id, "IsDefinedBy")
                    if (!sets) continue
                    for (const expressID of sets) {
                        const set = await model.getProperties(expressID)
                        const { name: setName } = await OBC.IfcPropertiesUtils.getEntityName(model, expressID)
                        if (set?.type !== WEBIFC.IFCELEMENTQUANTITY || !setName) continue
                        if (!(setName in this._qtoResult)) { this._qtoResult[setName] = {} }
                        await OBC.IfcPropertiesUtils.getQsetQuantities(
                        model,
                        expressID,
                        async (qtoID) => {
                            const { name: qtoName } = await OBC.IfcPropertiesUtils.getEntityName(model, qtoID)
                            const { value } = await OBC.IfcPropertiesUtils.getQuantityValue(model, qtoID)
                            if (!qtoName || !value) { return }
                            if (!(qtoName in this._qtoResult[setName])) { this._qtoResult[setName][qtoName] = 0 }
                            this._qtoResult[setName][qtoName] += value
                        }
                        )
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
    }
}
