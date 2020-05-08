
INSTALL

npm install cartod2


    • intramax()
      
Génère un objet d3-hierarchy à partir d’un objet topojson et d’une matrice de flux csv, selon la méthode intramax mise au point par Masser & Brown 1.

INPUT :  topojsonObject, featureIdKey, odMatrix, projection

-topojsonObject  (Objet) : Objet topojson ( de type typology) dont l’attribut objects est une geometryCollection. Les coordonnées des géométries doivent être en WGS84.

-featureIdKey  (String) : Chaîne de caractère contenant l’attribut identifiant chaque feature de la geometryCollection de l’objet topojson. Si cet attribut n’est pas un attribut direct de la feature, les sous-attributs doivent être séparés par un « / ». 
Ex : « properties/code_insee »

-odMatrix (String) : Chaîne de caractère formaté en csv contenant la liste des flux. Doit contenir 3 en-têtes : 
    • L’identifiant de l’origine du flux (String ou Number)
    • L’identifiant de la destination du flux (String ou Number)
    • La valeur du flux (String ou Number)

ATTENTION : Les identifiants contenus dans le topojson et dans la matrice de flux doivent être strictement les mêmes. Aucun identifiant de la matrice de flux ne doit être absent du topojson et inversement.


    • clusterGeom()

Génère un objet d3-hierarchy possédant différents attributs géométriques, à partir d’un objet topojson et d’une matrice de flux csv, selon la méthode intramax mise au point par Masser & Brown.

INPUT :  topojsonObject, featureIdKey, odMatrix, projection

-topojsonObject  (Objet) : Objet topojson ( de type typology) dont l’attribut objects est une geometryCollection. Les coordonnées des géométries doivent être en WGS84.

-featureIdKey  (String) : Chaîne de caractère contenant l’attribut identifiant chaque feature de la geometryCollection de l’objet topojson. Si cet attribut n’est pas un attribut direct de la feature, les sous-attributs doivent être séparés par un « / ». 
Ex : « properties/code_insee »

-odMatrix (String) : Chaîne de caractère formaté en csv contenant la liste des flux. Doit contenir 3 en-têtes : 
    • L’identifiant de l’origine du flux (String ou Number)
    • L’identifiant de la destination du flux (String ou Number)
    • La valeur du flux (String ou Number)

ATTENTION : Les identifiants contenus dans le topojson et dans la matrice de flux doivent être strictement les mêmes. Aucun identifiant de la matrice de flux ne doit être absent du topojson et inversement.

-projection (Fonction) : Fonction de projection qui prend en entrée un tableau de coordonnées en WGS84, et retourne un tableau de coordonnées projetées (dans l’unité voulue, cela n’a pas d’importance).

RETOURNE : Un objet de type d3-hierarchy dont chaque nœud contient les attributs suivants :

    • leavesIds (Array) : Un tableau contenant les identifiants de ses feuilles (String).
    • leavesGeometries (Array) : Un tableau contenant les géométries de chacune de ses feuilles (Polygon ou Multipolygon)
    • leavesCentroids (Array) : Tableau contenant les coordonnées des centroïdes de chaque feuille en WGS84 (Array).
    • clusterArea (Float) : Surface du cluster correspondant au nœud (en km²) calculé avec la fonction turf.area.
    • clusterCentroid (Array) : Coordonnées du centroïde du cluster correspondant au nœud en WGS84.
    • circleRadius (Float) : Rayon du cercle sur lequel sont projetées les centroïdes de chaque feuille du nœud, selon la méthode de placement circulaire mise au point par Bahoken et al. (en km).
    • newLeavesPositions (Array) : Coordonnées projetées (selon la fonction de projection entrée) des feuilles du nœud une fois projetées sur le cercle de rayon circleRadius.
    • newLeavesObjects (Array) : Tableau contenant les feuilles du nœud ( type Objet d3-hierarchy). Chaque feuille possède les attributs :
        ◦  newPosition (Array) contenant ses nouvelles coordonnées projetées une fois projetée sur le cercle correspondant au nœud auquel elle se rattache.
        ◦ incomingFlows (Array) contenant les flux dont la feuille est la destination, sous forme de tableau contenant deux objets de type d3-hierarchy : l’origine du flux, et la destination du flux (donc la feuille elle même).




    • cut()

Scinde un objet de type d3-hierarchy en un nombre de clusters voulus.

INPUT : dendo, nbCluster

-dendo (Objet) : Objet de type d3-hierarchy 
-nbCluster (int) : Nombre de cluster ou « sous-régions » souhaité

RETOURNE : Tableau contenant : 
    • Un tableau contenant les nœuds du dendo extraits pour le nombre de cluster souhaité
    • Un tableau associatif qui associe à chaque identifiant des feuilles du dendo un nombre qui représente le cluster dans lequel elle se trouve


    • generateFlows()

Génère un tableau de flux à partir d’une liste d’objets d3-hierarchy.

INPUT : subDendos

-subDendos (Array) : Tableau contenant les objets d3-hierarchy correspondant à des clusters. Ces objets doivent contenir un attribut newLeavesObjects, généré par la fonction clustering().

RETOURNE : Tableau de flux, donc chaque flux représente un tableau contenant deux objets de type d3-hierarchy : l’origine du flux, et la destination du flux.


    • line()

Fonction permettant de relier chaque couple d’objets contenu dans le tableau résultant de la fonction flows() par la méthode de Hierarchical Edge Bundling.  Cette fonction se base sur la fonction d3.line().

INPUT : path, projection, curve, force

-path (Array) : Tableau d’objets d3-hierarchy représentant chaque étape du chemin entre deux feuilles appartenant au même « arbre ». S’obtient par la fonction path entre deux objets d3-hierarchy appartenant au même « arbre ». Pour plus de détails voir https://github.com/d3/d3-hierarchy
-projection (Function) : Fonction de projection. Doit être la même que celle qui a permit de généré le dendo dont sont issues les objets de l’élément path.
-curve (function d3.curve) : Type de courbe d3. Fonctionne avec : d3.CurveBundle.beta. d3.curveCardinal.tension, d3.curveCattmullRom.alpha. Pour plus de détails : http://bl.ocks.org/d3indepth/b6d4845973089bc1012dec1674d3aff8

-force (Float): Nombre entre 0 et 1 représentant la courbure la courbure des courbes tracées.

RETOURNE : Chaîne de caractères formatée en « line » d3. Voir https://github.com/d3/d3-shape#lines



    • flowsArray()

Fonction permettant de générer un tableau d’objet représentant les flux d’une matrice OD en format csv.

ENTREE : odMatrix

-odMatrix (String) : Chaîne de caractère formaté en csv contenant la liste des flux. Doit contenir 3 en-têtes : 
    • L’identifiant de l’origine du flux (String ou Number)
    • L’identifiant de la destination du flux (String ou Number)
    • La valeur du flux (String ou Number)

RETOURNE : Tableau d’objets représentant chacun une ligne de la matrice OD



    • featureCollection()

Fonction permettant d’extraire la featureCollection depuis un objet topojson.

INPUT : topojsonObject

-topojsonObject  (Objet) : Objet topojson ( de type typology) dont l’attribut objects est une geometryCollection.

RETOURNE : Objet de type FeatureCollection


    • bboxLength()

Fonction calculant la longueur de la bounding box d’une featureCollection dans l’unité d’une projection donnée, ainsi qu’en km.

INPUT : featureCollection, projection

-featureCollection (Objet) : Objet de type FeatureCollection dont les coordonnées sont en WGS84.
-projection (Fonction) : Fonction de projection qui prend en entrée un tableau de coordonnées en WGS84, et retourne un tableau de coordonnées projetées (dans l’unité voulue, cela n’a pas d’importance).

RETOURNE : Tableau contenant :

    • La longueur de la bounding box de la featureCollection en unité projetée (se référant à la projection utilisée)
    • La longueur de la bounding box en kilomètres, calculée par la fonction turf.distance().



    • projectionScale()


Fonction permettant à partir d’une distance en kilomètres, de retourner une distance en une unité projetée définie. Cette unité dépend du système de projection utilisé pour générer le paramètre bboxLength

INPUT : bboxLength

-bboxLength (Array) : Tableau contenant une distance en unité d’un système de projection quelconque, et une distance en kilomètres.

RETOURNE : Une fonction de type d3.scaleLinear dont :
    • Le domain va de 0 à la longueur de la bouding box en unité projetée
    • Le range va de 0 à la longueur de la bounding box en kilomètres.



    • flowsMap()

Fonction retournant, à partir d’un tableau de flux résultat de la fonction flowsArray(), un tableau associant à chaque couple d’identifiant origine et destination d’un flux, la valeur de ce flux.

INPUT : flowsArray

-flowsArray (Array) : Tableau d’objets représentant chacun une ligne de la matrice OD.

RETOURNE : Tableau associant à chaque couple d’identifiant origine et destination d’un flux, la valeur de ce flux.


    • flowsScale()

Fonction retournant une fonction de type d3.scaleLinear permettant, à partir  d’une valeur de flux,  de retourner son épaisseur dans uen projection donnée.

INPUT : flowsArray, featureCollection, projection, smallestFlowRatio, biggestFlowRatio

-flowsArray (Array) : Tableau d’objets représentant chacun une ligne de la matrice OD.
-featureCollection (Objet) : Objet de type FeatureCollection dont les coordonnées sont en WGS84.
-projection (Fonction) : Fonction de projection qui prend en entrée un tableau de coordonnées en WGS84, et retourne un tableau de coordonnées projetées (dans l’unité voulue, cela n’a pas d’importance).
-smallestFlowRatio  (Int) : Nombre par lequel sera divisé la longueur de la bounding box de la featureCollection (en unités projetées) pour obtenir l’épaisseur du plus petit flux. Autrement dit : épaisseur = longBbox / smallestFlowRatio
-biggestFlowRatio  (Int) : Pareil que  smallestFlowRatio pour le plus gros flux.

RETOURNE : Une fonction de type d3.scaleLinear dont :
    • Le domain va de la plus petite valeur de flux de flowsArray à la plus grande
    • Le range va de 0 à la plus petite épaisseur de flux (calculée avec smallestFlowRatio) à la plus grande


    • unfoldJson()

Fonction retournant l’identifiant d’une feature à partir de l’arborescence menant à cet attribut.

INPUT : feature, featureIdKey

-feature (Objet) : Objet de type feature.
-featureIdKey  (String) : Chaîne de caractère contenant l’attribut identifiant la feature. Si cet attribut n’est pas un attribut direct de la feature, les sous-attributs doivent être séparés par un « / ». 
Ex : « properties/code_insee »
RETOURNE : Une chaine de caractères correspondant à l’identifiant de la feature 
