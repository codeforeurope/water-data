#!/bin/bash

wget -nc https://github.com/tabulapdf/tabula-java/releases/download/0.9.2/tabula-0.9.2-jar-with-dependencies.jar

array=( "baanhoek" "berenplaat" "braakman" "haamstede" "halsteren" "kralingen" "midden-zeeland" "ouddorp")
for i in "${array[@]}"
do
  #wget -nc -O ../reports/evides/evides-waterkwaliteit-$i.pdf https://www.evides.nl/-/media/files/waterkwaliteit/evides-waterkwaliteit-$i.pdf
  java -jar tabula-0.9.2-jar-with-dependencies.jar -g -f CSV -o ../reports/evides/evides-waterkwaliteit-$i.csv ../reports/evides/evides-waterkwaliteit-$i.pdf
done

npm install csvtojson
node evides_tabula.js
rm ../reports/evides/*.csv
