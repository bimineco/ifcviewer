import * as OBC from "@thatopen/components";
import * as CUI from '@thatopen/ui-obc'
import { FragmentsGroup } from "@thatopen/fragments"
import { AppManager } from "../../bim-components";


export default async function (model: FragmentsGroup,
  components: { get: (component: any) => any }, 
  ): Promise<{ classifications: any[] }> {

  if (!model || !model.hasProperties) return { classifications: [] }
  const indexer = components.get(OBC.IfcRelationsIndexer)
  const classifier = components.get(OBC.Classifier);
  
  await indexer.process(model)
  classifier.byEntity(model);
  await classifier.bySpatialStructure(model);
  console.log(indexer)
  console.log(classifier)
  
  classifier.bySpatialStructure(model);
  classifier.byEntity(model);
  const classifications = [
    { system: "entities", label: "Entities" },
    { system: "spatialStructures", label: "Spatial Containers" }
  ];
  
  const appManager = components.get(AppManager)
  appManager.loadClassifications(classifications)
  return { classifications }
}  
