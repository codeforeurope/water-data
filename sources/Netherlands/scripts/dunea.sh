#!/bin/bash

wget -nc https://github.com/tabulapdf/tabula-java/releases/download/0.9.2/tabula-0.9.2-jar-with-dependencies.jar
java -jar tabula-0.9.2-jar-with-dependencies.jar -g -f CSV -o ../reports/dunea/ -b ../reports/dunea

npm install csvtojson
node dunea_tabula.js
rm ../reports/dunea/*.csv
