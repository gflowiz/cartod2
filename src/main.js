import * as tools from "./tools.js"
import * as circularProjection from "./circularProjection.js"
import * as intramaxModule from "./intramax.js"
import * as flows from "./flows.js"
import * as clusterGeometry from "./clusterGeometry.js"



/**
 * TOOLS
 */
  /**
   * FLOWS
   */


export const flowsArray = tools.getFlowsArray  
export const flowsMap = tools.getFlowsMap 
export const flowsScale = tools.getFlowsScale  
export const featureCollection = tools.getFeatureCollection  
export const bboxLength = tools.getBboxLength  
export const projectionScale = tools.getProjectionScale  
export const unfoldJson = tools.unfoldJson  
export const line = tools.line  
export const cut = intramaxModule.cut


/**
 * INTRAMAX
 */

 /**
 * Fonction qui exécute la fonction intramax() avec les paramètres dérivés du json et de la matrice de flux en entrée.
 *@param {Objet} jsonObject Objet de type topology dont la géométrie est une geometrycollection
 *@param {String} featureIdKey  Chaîne de caractère contenant l’attribut identifiant chaque feature de la geometryCollection 
 *de l’objet topojson. Si cet attribut n’est pas un attribut direct de la feature, les sous-attributs doivent être 
 *séparés par un « / ». Ex : « properties/code_insee »
 *@param {String} odMatrix  Matrice OD formatée en csv avec 3 en-têtes : l'origine du flux, la destination, et la valeur.
 *Les valeurs peuvent être en string ou number ( la valeur du flux sera parsée et transformée en int)
 @returns {Object} Objet à structure hierarchique
 */
export function intramax  (jsonObject, featureIdKey, odMatrix) {

    let flowsArray = tools.getFlowsArray ( odMatrix )
    let flowsIds = tools.getFlowsIds ( flowsArray )
    let jsonIds = tools.getJsonIds ( jsonObject, featureIdKey )
    
    let conformity = tools.checkConformity ( jsonIds , flowsIds )
    if ( conformity !== true ) {alert('Erreur : Les ids du json rentré ainsi que de la matrice de flux ne sont pas strictement les mêmes.') ;  return }
    
    let jsonHashIds = tools.getHashIds ( jsonIds )
    let neiArray = intramaxModule.getNeighborsArray ( jsonObject )
    let neiMatrix = intramaxModule.getNeighborsMatrix(neiArray,jsonIds)
    let flowsMatrix = intramaxModule.getFlowsMatrix(flowsArray,jsonIds,jsonHashIds)
    let dendo = intramaxModule.intramax(flowsMatrix,neiMatrix,jsonIds)
  
    return dendo
  }



/**
 * CLUSTER GEOMETRY
 */

   /**
 * Fonction produisant un Objet à structure hierarchique par fusions successives des entités d'indices (l,l) dans les
 * matrices carrées de voisinage et de flux d'ordres l. Chaque objet et sous objet en sortie possède l'identifiant correspondant
 * dans le tableau jsonIds
 *@param {Objet} jsonObject Objet de type topology dont la géométrie est une geometrycollection
 *@param {String} featureIdKey  Chaîne de caractère contenant l’attribut identifiant chaque feature de la geometryCollection 
 *de l’objet topojson. Si cet attribut n’est pas un attribut direct de la feature, les sous-attributs doivent être 
 *séparés par un « / ». Ex : « properties/code_insee »
 * @param {String} odMatrix  Matrice OD formatée en csv avec 3 en-têtes : l'origine du flux, la destination, et la valeur.
 *Les valeurs peuvent être en string ou number ( la valeur du flux sera parsée et transformée en int)
 * @param {Function} projection Fonction de projection qui prend en entrée un tableau de coordonnées en WGS84, 
 * et retourne un tableau de coordonnées projetées (dans l’unité voulue, cela n’a pas d’importance).
 * @returns {Object} Objet de type d3-hierarchy
 */

export function clusterGeom  (jsonObject, featureIdKey, odMatrix, projection ) {
    
    let flowsArray = tools.getFlowsArray ( odMatrix )
    let flowsIds = tools.getFlowsIds ( flowsArray )
    let jsonIds = tools.getJsonIds ( jsonObject, featureIdKey )
    
    let conformity = tools.checkConformity ( jsonIds , flowsIds )
    if ( conformity !== true ) {alert('Erreur : Les ids du json rentré ainsi que de la matrice de flux ne sont pas strictement les mêmes.') ;  return }
    
    let jsonHashIds = tools.getHashIds ( jsonIds )
    let neiArray = intramaxModule.getNeighborsArray ( jsonObject )
    let neiMatrix = intramaxModule.getNeighborsMatrix(neiArray,jsonIds)
    let flowsMatrix = intramaxModule.getFlowsMatrix(flowsArray,jsonIds,jsonHashIds)
    let dendo = intramaxModule.intramax(flowsMatrix,neiMatrix,jsonIds)
  
  
    let featureCollection = tools.getFeatureCollection ( jsonObject )
    let featuresMap = tools.mapFeatures ( featureCollection, featureIdKey )
  
    let dendoHier = clusterGeometry.getDendo (dendo,featuresMap)
  
    flows.getImports ( dendoHier, flowsArray )
  
    let bboxLength = tools.getBboxLength ( featureCollection, projection )
    let projectionScale = tools.getProjectionScale ( bboxLength )
    circularProjection.getNewLeaves(dendoHier,  projection, projectionScale)
    circularProjection.retrieveParents ( dendoHier )
  
    return dendoHier
  }

  /**
   * Coupe un dendogramme et actualise la position de tous les clusters. La nouvelle position
   * des clusters est calculée en fonction de la nouvelle position de leurs feuilles pour un
   * nombre "nbCluster" de clusters. Elle est enregistrée dans l'attribut 'newClusterCentroid'.
   * @param {Object} dendo Objet d3-hierarchy
   * @param {Number} nbCluster Nombre de cluster souhaité
   * @returns {Array} Tableau de plusieurs objets d3-hierarchy
   */

  export function cutAndUpdate (dendo, nbCluster) {
  
    let subDendos = intramaxModule.cut(dendo, nbCluster)[0]
    return circularProjection.updateClustersCentroids(dendo,subDendos)
  
  }
  

 /** 
 * Génère un "tableau de flux" à partir d'un tableau d'objets d3-hierarchy. En clair, cette fonction applati les attributs
 * incomingFlows des éléments newLeavesObjects des clusters en entrée.
 * @param {Array} subDendos Tableau d'objets d3-hierarchy (résultat de la fonction cut())
 * @returns {Array} Dont chaque élément représente un flux.
 * 
 */
export function generateFlows  (subDendos) {

  flows.bilink2 (subDendos)
  
  let tab = subDendos.flatMap( dendo =>  dendo.newLeavesObjects.map ( leaf => leaf.incomingFlows) )
  return tab.flat()
}








