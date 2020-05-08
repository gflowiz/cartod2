/**
 * Associe à chaque identifiant du tableau de flux flowsArray, les flux dont il est la destination
 * @param {Array} flowsArray Tableau d'objets représentant chacun un flux (avec origin, destination et valeur)
 * @returns {Object}
 */
export function extractImports  (flowsArray) {
    let flows_assoc = {};
    let destinationKey = Object.keys(flowsArray[0])[1]
    
    flowsArray.forEach(function(flow) {
  
      if (typeof flows_assoc[flow[destinationKey]] == 'undefined') {flows_assoc[flow[destinationKey]] = []}
  
      flows_assoc[flow[destinationKey]].push(flow)
    })
    
    return flows_assoc
                                
  }
  
  /**
   * Ajoute à chaque feuille d'un dendo un attribut contenant tous les flux dont il est la destination
   * @param {Object} dendo Objet d3-hierarchy
   * @param {Array} flowsArray Tableau d'objets représentant chacun un flux (avec les attributs d'origine, de destination
   * et de valeur)
   */
  export function getImports (dendo, flowsArray){
    
    let flowsImports = extractImports (flowsArray)
    
    //On crée l'attribut import pour les feuilles du dendo
    dendo.leaves().forEach(function(leaf) {
      leaf["incomingFlows"] = flowsImports[leaf.leavesIds[0]]
    })    
    return dendo
  }

  /**
 * Ajoute à chaque newLeavesObjects des dendo contenus dans le tableau dendos, un attribut incomingFlows contenant l'origine
 * et la destination (lui même ) de chaque flux dont il est la destination.Donc l'attribut incomingFlows est un tableau
 * de longueur n (n étant le nombre de flux reçus par par la feuille en question), est donc chaque élément est un tableau
 * de 2 objets (origine, destination). Cet attribut est utile pour tracer les courbes entre feuillesvia la méthode de 
 * edge bundling
 * @param {Array} dendos Liste d'objets d3-hierarchy
 * @returns {Array} dendos modifiés
 */
export function bilink2  (dendos) {
  
    let leavesObjectsMap = {}
    let leavesImportsMap = {}
    let originKey = Object.keys( dendos[0].leaves()[0].incomingFlows[0])[0]
    
    dendos.forEach ( subdendo => {
  
        subdendo.newLeavesObjects.forEach ( leaf => {
          leavesObjectsMap[leaf.data.id] = leaf
  
        })
  
        subdendo.leaves().forEach ( leaf => {
          leavesImportsMap[leaf.data.id] = leaf.incomingFlows
        })
  
    })
  
    for (let cluster of dendos ) {
  
      for (let leaf of cluster.newLeavesObjects )  {
          
        let leafImports = leavesImportsMap[leaf.data.id]
  
        leaf.incomingFlows = []
        
        for ( let flow of leafImports )  {
          
          let originId = flow[originKey]
          let origin = leavesObjectsMap[originId]
          let destination = leaf
  
          let incomingFlows = [origin, destination]
          leaf.incomingFlows.push ( incomingFlows )
  
  
        }
      }
  
    }
  
    return dendos;
  }

  /**
 * Génère un "tableau de flux" à partir d'un tableau d'objets d3-hierarchy. En clair, cette fonction applati les attributs
 * incomingFlows des éléments newLeavesObjects des clusters en entrée.
 * @param {Array} subDendos Tableau d'objets d3-hierarchy (résultat de la fonction cut())
 * @returns {Array} Dont chaque élément représente un flux.
 * 
 */
export function generateFlows  (subDendos) {

  bilink2 (subDendos)

  let tab = subDendos.flatMap( dendo =>  dendo.newLeavesObjects.map ( leaf => leaf.incomingFlows) )
  return tab.flat()
}
