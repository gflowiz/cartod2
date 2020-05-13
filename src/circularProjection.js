/**
 * Fonction permettant de projeter un point sur un cercle de centre et rayon connu (Méthode Françoise Bahoken)
 * @param {Array} circleCenter Coordonnées du centre du cercle
 * @param {Number} radius Rayon du cercle en unité du système de projection en paramètre de la fonction getNewLeaves(),
 * qui appelle cette fonction.
 * @param {Array} pointToTranslate Coordonnées du point à projeter
 * @returns {Array} Coordonnées de la nouvelle position
 */
export function getNewPosition  (circleCenter,radius, pointToTranslate) {

    //Prise en compte du cas ou le centre du cercle et le point à translater sont au même endroit
    if (circleCenter[0] == pointToTranslate[0] & circleCenter[1] == pointToTranslate[1] ) {
      return [circleCenter[0], circleCenter[1] ] 
    }
  
    let a = circleCenter
    let b = pointToTranslate
    let vect_ba = [ a[0] - b[0], a[1] - b[1] ]
    //On normalise le vecteur ba ( pour que sa norme soit égale à 1)
    let norm_ab = Math.sqrt ( vect_ba[0]**2 + vect_ba[1]**2 )
    let coef_norm = 1 / norm_ab 
    let vect_ba_norm = [ vect_ba[0]*coef_norm, vect_ba[1]*coef_norm]
  
    //On calcule le nouveau vecteur qui va permettre de passer du centre du cercle au nouveau point
    let new_vect = [ -vect_ba_norm[0]*radius , -vect_ba_norm[1]*radius ]
    //Puis la nouvelle position (en partant du centre du cercle) 
    let new_position = [ a[0] + new_vect[0] , a[1] + new_vect[1] ]
  
  return new_position
  
  }
  
  /**
   * Permet d'ajouter à un objet d3-hierarchy l'attribut newLeavesPositions et newLeavesObjects
   * @param {Object} dendo Objet de type d3-hierarchy
   * @param {Function} projection Fonction de projection qui prend en entrée un tableau de coordonnées en WGS84, 
   * et retourne un tableau de coordonnées projetées (dans l’unité voulue, cela n’a pas d’importance).
   * @param {Function} projectionScale Une fonction de type d3.scaleLinear dont :
      • Le domain va de 0 à la longueur de la bouding box du topojson à partir de laquelle dendo
      a été généré en unité de la projection ci-dessus
      • Le range va de 0 à la longueur de cette bounding box en kilomètres.
    @returns {Object} Objet de type d3-hierarchy dont chaque noeud possède un attribut newLeavesPosition qui 
    compile toutes les positions de ses feuilles, ainsi qu'un attribut newLeavesObjetcs qui est une copie de l'objet 
    correspondant à chacune de ses feuilles (Attention : ces objets n'ont aucun ascendant, voir d3.copy())
   */
  
  export function getNewLeaves (dendo, projection, projectionScale ) {
    
    
    dendo.each( cluster => {
      
  
      cluster.newLeavesPositions = []
      cluster.newLeavesHashPositions = {}
      cluster.newLeavesObjects = []
      
      let circleCenter =   projection ( cluster.clusterCentroid ).map( coord => Math.round(coord*100)/100)
      let radius = projectionScale(cluster.circleRadius)
  
      cluster.leaves().forEach ( subcluster => {
  
        let leafCenter =   projection ( subcluster.clusterCentroid ).map( coord => Math.round(coord*100)/100) 
  
        try { 
  
          let leafNewPosition = getNewPosition ( circleCenter, radius, leafCenter )
          cluster.newLeavesPositions.push ( leafNewPosition )

          cluster.newLeavesHashPositions[subcluster.data.id] = leafNewPosition
          
          let subcluster_copy = subcluster.copy()
          subcluster_copy.newPosition = leafNewPosition
          cluster.newLeavesObjects.push ( subcluster_copy )
          
        }
        
        catch(e) {
          console.error(e)
          return
        }
  
  
        })
      return cluster
    })
    
    
    return dendo
  }
  
  /**
   * Permet d'affecter à chaque newLeavesObjects (voir getNewLeaves()) de chaque noeud, le parent qui lui correspond dans
   * l'arbre de référence (dendo)
   * @param {Object} dendo Objet d3-hierarchy
   * @returns {Object} Objet d3-hierarchy
   */
  
  export function retrieveParents  (dendo) {
    
    //On crée le tableau associatif permettant de d'associer à chaque id son objet, et ainsi retrouver par la suite son parent
    let leaves_map = {}
    dendo.leaves().forEach( leaf => {
      leaves_map[leaf.data.id] = leaf
    } )
    
    dendo.each ( cluster => {
      cluster.newLeavesObjects.forEach ( leaf => {
        leaf.parent = leaves_map[leaf.data.id].parent
      })
    })
    
    return dendo
  }


  export function updateClustersCentroids (dendo, dendos) {
  
  
    let hashPositions = {}
    
    for (let dendo of dendos) {
      
      for (let leaf of dendo.newLeavesObjects) {
        let leafId = leaf.data.id
         hashPositions[leafId] = leaf.newPosition
      }
  
  
        }
    
      
      dendo.each ( cluster => {
        
        cluster.newLeavesPositions = []
        
        for (let id of cluster.leavesIds) {
  
          let position = hashPositions[id]
          cluster.newLeavesPositions.push(position)
          
         }
  
  
        if (cluster.leaves().length === 1 ) {cluster.newClusterCentroid = cluster.clusterCentroid}
        else if (cluster.leaves().length === 2 ) {
  
          let points = cluster.newLeavesPositions
          let newPoint = [(points[0][0]+points[1][0])/2, (points[0][1]+points[1][1])/2]
          cluster.newClusterCentroid = newPoint
        }
        else {
  
          let sumX = 0
          let sumY = 0
          let nbPoints = cluster.newLeavesPositions.length
  
          for (let i = 0; i < nbPoints; i++) {
            sumX += cluster.newLeavesPositions[i][0]
            sumY += cluster.newLeavesPositions[i][1]
  
        }
          let newPoint = [sumX/nbPoints, sumY/nbPoints]
          cluster.newClusterCentroid = newPoint
  
        }
  
  
  
  
    })
    
  return dendos
  }