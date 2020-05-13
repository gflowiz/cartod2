import * as d3 from "d3@5"
import * as turf from "@turf/turf"
import * as topojson from "topojson-client"

/**
*@param {Objet} topojsonObject: Objet de type topology dont la géométrie est une geometrycollection
*@param {String} featureIdKey : Chaîne de caractère contenant l’attribut identifiant chaque feature de la geometryCollection 
*de l’objet topojson. Si cet attribut n’est pas un attribut direct de la feature, les sous-attributs doivent être 
*séparés par un « / ». Ex : « properties/code_insee »
*@returns {Array} : Tableau contenant tous les ids contenus dans le topojson, en format string
*/

export function getJsonIds  (topojsonObject, featureIdKey ) {
  
    let entityKey = Object.keys( topojsonObject.objects )[0]
    return topojsonObject.objects[entityKey].geometries.map( c =>  unfoldJson(c, featureIdKey ).toString())
}

/**  
 *@param {Array} idsArray : Tableau contenant des identifiants.
 *@returns {Object}: Tableau associatif associant à chaque id de idsArray, son indice dans le tableau
*/
export function getHashIds (idsArray ) {
  let hash ={} 
  idsArray.forEach((ids,i) => hash[ids]=i)
  return hash

}

/**
 * @param {String} csvText : Matrice OD formatée en csv avec 3 en-têtes : l'origine du flux, la destination, et la valeur.
 *Les valeurs peuvent être en string ou number ( la valeur du flux sera parsée et transformée en int)
 *@returns {Array}  Tableau d’objets représentant chacun une ligne de la matrice OD
 */

export function getFlowsArray (csvText) {

    let array = d3.csvParse ( csvText )

    let countkey = Object.keys(array[0])[2]
    array.forEach ( flow => {
        flow[countkey] = parseInt(flow[countkey],10) 

    })

    return array 
}

/**
 * Associe à chaque couple d'identifiants d'un même flux dans la matrice OD, la valeur de ce flux
 * @param {Array} flowsArray Tableau de flux issu de la matrice OD(résultat de la fonction getFlowsArray())
 * @returns {Object} 
 */
export function getFlowsMap (flowsArray) {
  let f = {}
  let originKey = Object.keys(flowsArray[0])[0]  
  let destKey = Object.keys(flowsArray[0])[1]
  let countKey = Object.keys(flowsArray[0])[2]
  flowsArray.map( flow => f[flow[originKey].toString()+"-" +flow[destKey].toString()] = flow[countKey] )
  return f
}


/**
 * @param {Array} flowsArray : Tableau d'objet contenant 3 clés et représentant chacun un ligne de la matrice de flux 
 *(résultat de la fonction getFlowsArray).
 *@returns {Array} : Tableau contenant tous les ids contenus dans la matrice de flux
 */

export function getFlowsIds  (flowsArray) {

    let flowsKeys = getFlowsKeys(flowsArray)

    let originKey = flowsKeys[0]
    let destKey = flowsKeys[1]
    let ids = []
    flowsArray.forEach ( flow => {
        ids.push(flow[originKey], flow[destKey])
    })
    return ids.filter (unique)
}

/**
 * Fonction vérifiant si les deux listes d'identifiants en entrée sont de même longueur et contiennent les mêmes identifiants
 * @param {Array.<String>} jsonIds Liste des ids contenus dans le topojson
 * @param {Array.<String>} flowsIds Liste ds ids contenus dans la matrice de flux
 * @returns {boolean} true si les ids des deux tableaux sont strictement identiques, sinon false
 */
export function checkConformity  ( jsonIds, flowsIds) {
  
    if ( jsonIds.length !== flowsIds.length) {return false}
  
    let missingIds = []
    
    flowsIds.forEach ( id => {
      if (  jsonIds.includes(id) === false ) { missingIds.push (id) }
      else if ( jsonIds.includes(id) === false ) { missingIds.push (id) }
    })
    
    if (missingIds.length !== 0 ) {return false}
    else {return true}
  }

/**
 * Fonction retournant l’identifiant d’une feature à partir de l’arborescence menant à cet attribut. Note : est limité
 * à 2 sous-objets.
 * @param {Object} feature Objet de type feature
 * @param {String} featureIdKey Chaîne de caractère contenant l’attribut identifiant la feature. Si cet attribut n’est pas 
 * un attribut direct de la feature, les sous-attributs doivent être séparés par un « / ».Ex : « properties/code_insee »
 * @returns {*}  L’identifiant de la feature
*/
export function unfoldJson  (feature, featureIdKey ) {
    
    let keys = featureIdKey.split("/")
    
    if (keys.length === 1 ) {return feature[keys[0]]}
    else if ( keys.length === 2) {return feature[keys[0]][keys[1]]}
    else if ( keys.length === 3) {return feature[keys[0]][keys[1]][keys[2]]}
    else { console.log( " The path you entered contains more than 2 subObjects") }
  
}

/**
 * Permet de retourner les éléments uniques d'un tableau
 * @param {*} value éléments du tableau
 * @param {*} index index dans le tableau
 * @param {*} self tableau
 * @returns {Array} Tableau sans doublons
 */
export function unique (value, index, self) { 
    return self.indexOf(value) === index;
}

/**
 * Permet d'obtenir les clés d'origine, destination et de valeur de la matrice de flux à partir du tableau la contenant
* @param {Array} flowsArray : Tableau d'objet contenant 3 clés et représentant chacun un ligne de la matrice de flux 
 *(résultat de la fonction getFlowsArray).
 */
export function getFlowsKeys  ( flowsArray ) {
    let originKey = Object.keys ( flowsArray[0] )[0]
    let destKey = Object.keys ( flowsArray[0] )[1]
    let countKey = Object.keys ( flowsArray[0] )[2]
    return [originKey,destKey,countKey]
}

/**
 * Transforme un topojson en featureCollection
 * @param {Object} topojsonObject Objet de type topology contenant une featureCollection
 * 
 */
 export function getFeatureCollection  ( topojsonObject ) {
  
    let entityKey = Object.keys( topojsonObject.objects)[0]
    return topojson.feature(topojsonObject, topojsonObject.objects[entityKey])
  
  }

  /**
 * Objet associant chaque feature d'une featureCollection à son identifiant
 * @param {Objetc} featureCollection Objet de type featureCollection
 * @param {String} featureIdKey Chaîne de caractère contenant l’attribut identifiant la feature. Si cet attribut n’est pas 
 * un attribut direct de la feature, les sous-attributs doivent être séparés par un « / ».Ex : « properties/code_insee »
 * @returns {Object}
 */
export function mapFeatures  (featureCollection, featureIdKey ) {
    let map = {}
    for (let feature of featureCollection.features) {
      let id = unfoldJson ( feature , featureIdKey)
      map[id] = feature
    }
  
    return map
  
  }

  /**
 * Retourne la distance euclidienne entre deux points a et b
 * @param {Array.<Number>} a Premier point
 * @param {Array.<Number>} b Deuxième point
 */
export function getDistance (a,b) {
    let dist = Math.sqrt( (b[0] - a[0])**2 + (b[1] - a[1])**2)
    return dist
  }

  /**
 * Calcul de la longueur de la bounding box d'une featureCollection
 * @param {Object} featureCollection Objet de type feature collection 
 * @param {Function} projection Fonction de projection qui prend en entrée un tableau de coordonnées en WGS84, 
 * et retourne un tableau de coordonnées projetées (dans l’unité voulue, cela n’a pas d’importance).
 * @returns {Array} Tableau contenant la longueur de la bbox en unité de la projection utilisée, ainsi qu'en kilomètres
 */
export function getBboxLength (featureCollection, projection ) {
    let bbox = turf.bbox(featureCollection)
    
    let bottomRightCorner = [bbox[2],bbox[1]]
    let bottomLeftCorner = [bbox[0],bbox[1]]
    let bottomLeftCornerProj = projection([bbox[0],bbox[1]])
    let bottomRightCornerProj = projection([bbox[2],bbox[1]])
    
    let bboxLengthKm = turf.distance(turf.point(bottomLeftCorner),turf.point(bottomRightCorner), {"units":"kilometers"})
    let bboxLengthProj = getDistance(bottomLeftCornerProj,bottomRightCornerProj)
  
    
    return [bboxLengthProj,bboxLengthKm]
    
  }

  /**
 * Crée une d3.scaleLinear() pour convertir des km en unités d'une projection donnée
 * @param {Array} bboxLength -bboxLength (Array) : Tableau contenant une distance en unité 
 * du système de projection ayant servi à calculer bboxLength, et une distance en kilomètres (résultat de getBboxLength()).
 * @returns {Function} Une fonction de type d3.scaleLinear dont :
    • Le domain va de 0 à la longueur de la bouding box en unité projetée
    • Le range va de 0 à la longueur de la bounding box en kilomètres.
 * 
 */
export function getProjectionScale  (bboxLength) {
  
    let bboxLengthProj = bboxLength[0]
    let bboxLengthKm =  bboxLength[1]
    
    let scale = d3.scaleLinear().domain([0,bboxLengthKm]).range([0,bboxLengthProj])
  
    
    return scale
  }

  export function line  (path,projection,curve,force) {
  

    let line = d3.line()
  
      .x(function(d) {
        if (d.leaves().length === 1 ) { return d.newPosition[0]}
        else {return d.newClusterCentroid[0]}
      })
  
  
      .y(function(d) {
        if (d.leaves().length === 1 ) { return d.newPosition[1]}
        else {return d.newClusterCentroid[1]}
      })
  
      .curve( curve(force) )
  
    return line(path)
  
  }
  
  /**
 * Fonction retournant une fonction de type d3.scaleLinear permettant, à partir  d’une valeur de flux,  
 * de retourner son épaisseur dans uen projection donnée.
 * @param {Array} flowsArray Tableau d'objet (résultat de la fonction getFlowsArray)
 * @param {Object} featureCollection Objet de type featureCollection
 * @param {Function} projection Fonction de projection
 * @param {Number} smallestFlowRatio Nombre par lequel sera divisé la longueur de la bounding box de la featureCollection 
 * (en unités projetées) pour obtenir l’épaisseur du plus petit flux. 
 * Autrement dit : épaisseur = longBboxProj / smallestFlowRatio
 * @param {Number} biggestFlowRatio Pareil que smallestFlowRation pour le plus gros flux
 * @returns {Function} Fonction de type d3.scaleLinear dont :
    • Le domain va de la plus petite valeur de flux de flowsArray à la plus grande
    • Le range va de 0 à la plus petite épaisseur de flux (calculée avec smallestFlowRatio) à la plus grande
 */
export function getFlowsScale (flowsArray, featureCollection, projection, smallestFlowRatio, biggestFlowRatio ){

  let viewBoxLengthProj = getBboxLength(featureCollection, projection)[0]
  let flowsKeys = getFlowsKeys (flowsArray)
  let countKey = flowsKeys[2]
  
  let min = flowsArray[0][countKey]
  let max = flowsArray[0][countKey]
  flowsArray.forEach( function(flow) {
    if (flow[countKey] <=min){min = flow[countKey]}
    if (flow[countKey] >=max){max = flow[countKey]}
    
  })


  let minWidthProj = viewBoxLengthProj/smallestFlowRatio
  let maxWidthProj= viewBoxLengthProj/biggestFlowRatio
  let scale = d3.scaleLinear().domain([min,max]).range([minWidthProj,maxWidthProj])

  return scale
      
}