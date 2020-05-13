import * as mathjs from "mathjs"
import * as topojson from "topojson-client"
import * as tools from "./tools.js"


/**  
*@param {Objet} topojsonObject: Objet de type topology dont la géométrie est une geometrycollection
*@returns {Array}: Tableau de tableaux contenant chacun les indices, dans la liste des ids du topojson, 
des features de la geometrycollection qui touchent la feature d'indice l'indice auquel se rattache ce tableau.
Ex de ligne - 0 : [1,4,9,14] --> la feature d'indice 0 dans la liste des ids du topojson touche les features
d'indices 1,4,9 et 14.
*/
export function getNeighborsArray  ( topojsonObject ) {
    let entityKey = Object.keys(topojsonObject.objects)[0]
    return topojson.neighbors(topojsonObject.objects[entityKey].geometries)
}

/**
 * @param {Array.Array.<Number>} neibhorsArray Tableau de tableaux permettant d'identifier le voisinage des entités comprises dans
 * le topojson (résultat de la fonction getNeighborsArray)
 * @param {Array.<String>} jsonIds  Liste des identifiants des features comprises dans le fichier topojson
 * @returns {Object}  Objet de type mathjs sparse matrix dont les cellules contiennent 1 si les deux entités
 * auxquelles elle se rattache se touchent.
 */
export function getNeighborsMatrix  ( neibhorsArray , jsonIds ) {

    let n_mat = mathjs.sparse([[]],'number')
    n_mat.resize([jsonIds.length,jsonIds.length])
    neibhorsArray.forEach( function(current_nei,c){ 
        current_nei.forEach(n => n_mat.set([c,n],1))
    })
    return n_mat
}


/**
 *@param {Array.<Object>} flowsArray Tableau d'objet contenant 3 clés et représentant chacun un ligne de la matrice de flux 
 *(résultat de la fonction getFlowsArray).
 *@param {Array.<String>} idsArray  Tableau contenant des identifiants.
 *@param {Object} hashIds Objet associant à chaque id du json, son indice.
 *@returns {Object}  Objet de type mathjs sparse matrix (d'indices i,j) dont les cellules d'indices i et j
 *contiennent la valeur du flux entre les entités d'indice i et j.
 */
export function getFlowsMatrix  (flowsArray,idsArray, hashIds ) {
  

    let flowsKeys = tools.getFlowsKeys(flowsArray)

    let originKey = flowsKeys[0]
    let destinationKey = flowsKeys[1]
    let countKey = flowsKeys[2]
    
    let flowsMatrix = mathjs.sparse([[]],'number')
    flowsMatrix.resize([idsArray.length,idsArray.length],0)
    
    
    flowsArray.forEach( function(f) {
  
      
      if (Number.isInteger(f[countKey]) === true ) { 
        flowsMatrix.set([ hashIds[f[originKey]], hashIds[f[destinationKey]] ], f[countKey] ) 
      }
      
      else { flowsMatrix.set([ hashIds[f[originKey]], hashIds[f[destinationKey]] ], 0 ) }
      
    })
    
    return flowsMatrix
    
}

/** Recherche du max et de sa position dans une matrice sparse
 * @param {Object} sparse_mat Matrice sparse
 * @returns {Object} Tableau indiquant la valeur et l'index du maximum de la matrice sparse
 * */ 
export function which_max (sparse_mat){
    let index_max = new Array(2)
    let value_max = 0;
    sparse_mat.forEach(function(value,index,mat){
      if(value>value_max){
        value_max = value;
        index_max=index
      }
    },true)
    return {value:value_max,index:index_max}
}

/**
 * Effectue le total d'une matrice sparse
 * @param {Object} sparseMat Objet de type mathjs sparse matrix
 * @returns {Number} Le total
 */
export function total (sparseMat){
    let total = 0;
    sparseMat.forEach((v,i,m)=>total =total +v)
    return total
}

/**
 * Effectue la somme de chaque ligne d'une matrice sparse
 * @param {Object} sparseMat Matrice sparse
 * @returns {Array.<number>} Contient chaque somme de ligne de la matrice
 */
export function row_sums (sparseMat){
    let rs = new Array(sparseMat.size()[0]).fill(0)
    sparseMat.forEach((v,i,m)=>rs[i[0]] = rs[i[0]] +v,true)
    return rs
}

/**
 * Fonction effectuant la somme de chaque colonne d'une sparse matrix
 * @param {Object} sparseMat Matrice sparse
 * @returns {Array.<Number>} Contient chaque somme de colonne de la matrice
 */
export function col_sums (sparseMat){
    let cs = new Array(sparseMat.size()[1]).fill(0)
    sparseMat.forEach((v,i,m)=>cs[i[1]] = cs[i[1]] +v,true)
    return cs
}


/**
 * Fusionne deux entités d'indices (k,k) et (l,l) dans une sparse matrix
 * @param {Object} sparse_mat Matrice sparse 
 * @param {Number} k Valeur de l'indice de la première entité à fusionner
 * @param {*} l Valeur de l'indice de la deuxième entité à fusionner
 * @returns {Object} Sparse matrix mise à jour
 */
export function merge_region (sparse_mat,k,l){
    if(l<k){
      let temp = k
      k = l
      l = temp
    }
    let size = sparse_mat.size()[1]
    sparse_mat.set([k,k],sparse_mat.get([k,k])+sparse_mat.get([l,l]))
    sparse_mat.set([l,l],0)
    
    //Recupère l'index de la ligne k
    let rowk_index = mathjs.index(k,mathjs.range(0,sparse_mat.size()[1]))
    //Ajoute la ligne k et la ligne l
    let new_row = mathjs.add(mathjs.row(sparse_mat,k),mathjs.row(sparse_mat,l))
    //Remplace la ligne k par la new_row
    sparse_mat=mathjs.subset(sparse_mat,rowk_index,new_row)
    
    //Idem avec les colonnes
    let colk_index = mathjs.index(mathjs.range(0,sparse_mat.size()[0]),k)
    let new_col = mathjs.add(mathjs.column(sparse_mat,k),mathjs.column(sparse_mat,l))
    sparse_mat=mathjs.subset(sparse_mat,colk_index,new_col)
    
    let n_mat = mathjs.sparse([[]],'number')
    //Va remplir la matrice n_mat en écrasant les lignes et colonnes d'index l
    sparse_mat.forEach(function(value,index,mat){
      if(index[0]!=l & index[1]!=l){
        if(index[0]>l){
          index[0]=index[0]-1
        }
        if(index[1]>l){
          index[1]=index[1]-1
        }
        n_mat.set(index,value)
      }
    },true)
    //Comme je le vois, c'est pour le cas ou l est le dernier index.Il faut donc écraser la dernière ligne et colonne
    n_mat.resize([sparse_mat.size()[0]-1,sparse_mat.size()[1]-1])
    
    return n_mat
}

/**
 * Fonction produisant un Objet à structure hierarchique par fusions successives des entités d'indices (l,l) dans les
 * matrices carrées de voisinage et de flux d'ordres l. Chaque objet et sous objet en sortie possède l'identifiant correspondant
 * dans le tableau jsonIds
 * @param {Object} flows_mat Matrice de flux
 * @param {Object} nei_mat Matrice de voisinage
 * @param {Array} jsonIds Liste des identifiants compris dans le topojson
 * @returns {Object} Objet hierarchique issu des fusions successives
 */
export function intramax  (flows_mat,nei_mat,jsonIds){

    let N = flows_mat.size()[0] 
    //Initialize
    let current_cluster = jsonIds.map(function(id){return {id:id,h:0}})
    // build normalized matrix
    let flows_mat_norm = mathjs.multiply(flows_mat,1/total(flows_mat))
  
    // compute row_sums
    let row_sum = row_sums(flows_mat_norm)
    // compute col_sums
    let col_sum = col_sums(flows_mat_norm)
    let k,l=0;
    for (let merge_step =0;merge_step<N-1;merge_step++){
      // find the best merge k,l and value
      let index_max = new Array(2)
      let value_max = -1;
      let cval = 0
      nei_mat.forEach(function(value,index,mat){
  
        //scope half of the matrix (i<j) and 1 values (meaning regions are neighboors)
        if(index[0]<index[1] & nei_mat.get(index)!=0){
        //Computing flow measurement normalized function between i and j in both ways and saving maximum              //value/indexes
          cval=(flows_mat_norm.get(index)-row_sum[index[0]]*col_sum[index[1]])
          let index_op = [index[1],index[0]]
          cval+=(flows_mat_norm.get(index_op)-row_sum[index_op[0]]*col_sum[index_op[1]])
          if(cval>value_max){
            value_max = cval;
            index_max=index
          }
        }
      },true)
      k = index_max[0]
      l = index_max[1]
     //console.log("Merging "+k+", "+l+", h:"+cval)
  
  
      // update current_cluster
      current_cluster[k]={h:value_max,step:merge_step,children:     [current_cluster[k],current_cluster[l]]}
      current_cluster.splice(l,1)
      // apply the merge 
      // update normalized matrix
      flows_mat_norm = merge_region(flows_mat_norm,k,l)
      // update neirboors matrix
      nei_mat = merge_region(nei_mat,k,l)
  
      //console.log(nei_mat.size()[0])
      // update row_sums
      row_sum[k] = row_sum[k]+row_sum[l]
      row_sum.splice(l,1)
      // update col_sums
      col_sum[k] = col_sum[k]+col_sum[l]
      col_sum.splice(l,1)
    }
    return current_cluster[0]
}



/**
 * Fonction coupant un dendrogramme en k clusters
 * @param {Object} dendo Objet d3-hierarchy
 * @param {Number} K Nombre de cluster souhaité
 * @returns {Array} Tableau contenant un tableau contenant les noeuds issus de la partition, ainsi qu'un objet affectant
 * à chaque identifiant de feuille du dendo, un chiffre représentant son cluster
 */
export function cut (dendovar,K){

  let clusters = [dendovar]
  //Tant qu'on a pas le nombre de clusters voulu, on ajoute remplace le premier "cluster principal" par ses deux enfants
  for (let k =0;k<K;k++){
    
    while (clusters.length<K & !(typeof clusters[k].children === 'undefined')){
         
         clusters.push(clusters[k].children[1])
         clusters[k] = clusters[k].children[0]
         // On trie par ordre de "step", cad par ordre d'étape de fusion
         clusters.sort((c1,c2) => c2.data.step - c1.data.step);
    }
  
  }
  
  

  //On récupère les "feuilles" (élément sans enfants) des clusters
  let flat_clusters = clusters.map(c => c.leaves())
  let clusters_map ={}
  for (let k=0;k<K;k++){
    flat_clusters[k].forEach(z => clusters_map[z.data.id]=k)
  }
  return [clusters,clusters_map]
}