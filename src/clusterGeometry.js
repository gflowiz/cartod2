import * as turf from "@turf/turf"
import * as d3 from "d3@5"



/**
 * Ajoute à chaque noeud les ids de ses feuilles
 * @param {Object} dendo Object de type de type d3-hierarchy
 * 
 */
export function getLeavesId (dendo) {
    dendo.each( cluster => {
      let ids = []
      cluster.leaves().forEach(leaf => ids.push(leaf.data["id"]))
      cluster["leavesIds"] = ids;
    })
    return dendo
  }
  
  /**
   * Ajoute à chaque noeud la géométrie de ses feuilles
   * @param {Object} dendo Object de type de type d3-hierarchy
   * 
   */
  
  export function getLeavesGeom  (dendo, featuresMap) {
    
    dendo.each (function(cluster) {
      let geom = []
      cluster.leavesIds.forEach( id => {
                          geom.push(featuresMap[id].geometry)
      })
      
      cluster["leavesGeometries"] = geom
    })
  
    
    return dendo
  }
  
  /**
   * Ajoute à chaque noeud les centroïdes de ses feuilles
   * @param {Object} dendo Object de type de type d3-hierarchy
   * 
   */
  export function getLeavesCentroids (dendo) { 
      
    dendo.each (function(cluster) {
    let centroids = []
  
    cluster.leavesGeometries.forEach(geo => {
      centroids.push(turf.centroid(geo).geometry.coordinates)
    })
    cluster["leavesCentroids"] = centroids 
  
  })
   
  return dendo
  }
  
  /**
   * Ajoute à chaque noeud sa surface (en km²)
   * @param {Object} dendo Object de type de type d3-hierarchy
   * 
   */
  export function getClusterArea  (dendo) {
    
    dendo.each (function (cluster) {
      let superficie1 = [];
      let tabsuper = [];
      cluster.leavesGeometries.forEach (poly => {
        superficie1.push(turf.area(poly));
        poly["surface"] = turf.area(poly) / Math.pow(10, 6)
      })
      let sumsuper = 0;
      for (let i=0; i<superficie1.length; i++){
        sumsuper += superficie1[i];
      }
      cluster["clusterArea"] = sumsuper / Math.pow(10, 6);
    })
  }
  
  /**
   * Ajoute à chaque noeud les coordonnées de son centroïde (en prenant en compte la position initiale des feuilles)
   * @param {Object} dendo Object de type de type d3-hierarchy
   * 
   */
  export function getClusterCentroid  (dendo) {
  
    dendo.each(cluster => {
      let xS = 0;
      let yS = 0;
      let sumXP = 0;
      let sumYP = 0;
      for (let i = 0; i < cluster.leavesCentroids.length; i++){
        xS = cluster.leavesCentroids[i][0] * cluster.leavesGeometries[i].surface
        yS = cluster.leavesCentroids[i][1] * cluster.leavesGeometries[i].surface
        sumXP += xS
        sumYP += yS
      }
      cluster["clusterCentroid"] = [sumXP / cluster.clusterArea, sumYP / cluster.clusterArea]
    })
  }
  
  /**
   * Ajoute à chaque noeud les coordonnées de son centroïde (en prenant en compte la position projetée des feuilles)
   * @param {Object} dendo Object de type de type d3-hierarchy
   * 
   */
  export function getNewClusterCentroid (dendo) {
  
    dendo.each ( cluster => {
      
      
      cluster.newClusterCentroid = "undefined"
      
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
    
    return dendo
  }
  
  /**
   * Ajoute à chaque noeud le rayon du cercle servant à projeter ses feuilles (en km)
   * @param {Object} dendo Object de type de type d3-hierarchy
   * 
   */
  export function getCircleRadius (dendo) {
    dendo.each (cluster => {
      cluster["circleRadius"] = Math.sqrt(cluster.clusterArea / 2 / 3.14 )
    })
  }
  
  /**
   * Ajoute les attributs leavesIds,leavesGeom,leavesCentroids,clusterArea,clusterCentroid,newClusterCentroid,circleRadius
   * aux différents noeuds d'un dendo.
   * @param {Object} dendo Object de type de type d3-hierarchy
   * 
   */
  export function getDendo (dendo, featuresMap) {
  
    let dendoHier = d3.hierarchy(dendo)
  
    getLeavesId(dendoHier)
    getLeavesGeom(dendoHier, featuresMap )
    getLeavesCentroids(dendoHier)
    getClusterArea(dendoHier)
    getClusterCentroid(dendoHier)
    getCircleRadius(dendoHier)
  
    return dendoHier;
  }

