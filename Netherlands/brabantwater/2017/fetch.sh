#!/bin/bash
array=( "Bergen%20op%20Zoom" "Budel" "Dorst" "Eindhoven" "Genderen" "Haaren" "Helmond" "Lieshout" "Lith" "Loosbroek" "Luyksgestel" "Macharen" "Nuland" "Oirschot" "Oosterhout" "Prinsenbosch" "Roosendaal" "Schijf" "Schijndel" "Seppe" "Someren" "Son" "Tilburg" "Veghel" "Vessem" "Vlierden" "Vlijmen" "Welschap" "Wouw")
for i in "${array[@]}"
do
  wget https://www.brabantwater.nl/PompStationInfo/$i.pdf
done
