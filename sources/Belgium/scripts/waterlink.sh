#!/bin/bash
wget -nc https://github.com/tabulapdf/tabula-java/releases/download/0.9.2/tabula-0.9.2-jar-with-dependencies.jar

array=( "2015" "2016")
for i in "${array[@]}"
do
  wget -nc -O ../reports/waterlink/jaargemiddelden-web-$i.pdf https://www.water-link.be/files/uploads/document/jaargemiddelden-web-$i.pdf
  java -jar tabula-0.9.2-jar-with-dependencies.jar -p 1 -a 122.003,49.997,781.931,541.781 -f CSV -o ../reports/waterlink/jaargemiddelden-web-$i-1.csv ../reports/waterlink/jaargemiddelden-web-$i.pdf
  java -jar tabula-0.9.2-jar-with-dependencies.jar -p 2 -a 50.964,51.708,123.876,542.748 -f CSV -o ../reports/waterlink/jaargemiddelden-web-$i-2.csv ../reports/waterlink/jaargemiddelden-web-$i.pdf
done

#npm install csvtojson
#node waterlink_tabula.js
#rm ../reports/waterlink/*.csv
