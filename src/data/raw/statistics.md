  32732  TOTAL                        
  18700 Genus                       
   4084 Family                      
   2412 Variety                     
   1846 Subspecies                  
   1047 Species hybrid              
    863 Order                       
    823 Microspecies                
    476 Subfamily                   
    404 Species aggregate           
    389 Form                        
    297 Superfamily                 
    239 Species pro parte           
    226 Class                       
    143 Subgenus                    
    142 Suborder                    
     81 Subclass                    
     73 Tribe                       
     68 Phylum                      
     43 Section                     
     42 Infraorder                  
     39 Species sensu lato          
     38 Superorder                  
     35 Subspecies hybrid           
     32 Cultivar                    
     23 Subphylum                   
     18 Generic hybrid              
     17 Infraclass                  
     16 Forma specialis             
     11 Series                      
     11 Species group               
     11 Subkingdom                  
      8 Subspecies aggregate        
      7 Kingdom                     
      7 Parvorder                   
      6 Facies                      
      6 Infrakingdom                
      6 Nothosubspecies             
      6 Nothovariety                
      6 Superclass                  
      5 Abberation                  
      5 Infraphylum                 
      5 Subdivision                 
      5 Subsection                  
      3 Division                    
      3 Varietal hybrid             
      2 Genus aggregate             
      2 Morphotype                  
      1 Unranked                    


Worst case scenario: 
====================
Species Sci name first letter search counts.
--------------------------------------------

c={}; _.each(species_list, function(sp){
c[sp[2][0]] = c[sp[2][0]] || 1;
c[sp[2][0]]++;
})

A: 2351
B: 1038
C: 3062
D: 1171
E: 1222
F: 325
G: 778
H: 1362
I: 274
J: 97
K: 182
L: 1371
M: 1681
N: 727
O: 779
P: 3444
Q: 19
R: 674
S: 2145
T: 1456
U: 148
V: 247
W: 77
X: 162
Y: 18
Z: 160
x: 4


Species Common name first letter search counts.
-----------------------------------------------

c={}; _.each(pointers, function(p){
sp = window.species_list[p[0]][p[1]][p[2]][p[3]]

c[sp[0]] = c[sp[0]] || 1;
c[sp[0]]++;
}); console.log(c)


A: 551
B: 1233
C: 1234
D: 495
E: 280
F: 546
G: 742
H: 584
I: 160
J: 113
K: 110
L: 724
M: 587
N: 307
O: 235
P: 768
Q: 9
R: 696
S: 1897
T: 551
U: 46
V: 146
W: 691
Y: 184
Z: 19