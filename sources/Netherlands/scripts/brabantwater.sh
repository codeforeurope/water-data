#!/bin/bash
#array=( "Bergen%20op%20Zoom" "Budel" "Dorst" "Eindhoven" "Genderen" "Haaren" "Helmond" "Lieshout" "Lith" "Loosbroek" "Luyksgestel" "Macharen" "Nuland" "Oirschot" "Oosterhout" "Prinsenbosch" "Roosendaal" "Schijf" "Schijndel" "Seppe" "Someren" "Son" "Tilburg" "Veghel" "Vessem" "Vlierden" "Vlijmen" "Welschap" "Wouw")
#for i in "${array[@]}"
#do
#  wget -nc -O ../reports/brabantwater/$i.pdf https://www.brabantwater.nl/PompStationInfo/$i.pdf
#done

wget -nc https://github.com/tabulapdf/tabula-java/releases/download/0.9.2/tabula-0.9.2-jar-with-dependencies.jar
java -jar tabula-0.9.2-jar-with-dependencies.jar -p all -t -g -f CSV -o ../reports/brabantwater/ -b ../reports/brabantwater

npm install csvtojson
node brabantwater_tabula.js
rm ../reports/brabantwater/*.csv
