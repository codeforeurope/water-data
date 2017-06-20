#!/bin/bash
array=( "halsteren" "baanhoek" "berenplaat" "braakman" "haamstede" "kralingen" "midden-zeeland" "ouddorp")
for i in "${array[@]}"
do
  
  wget -O ../reports/evides/$i-$(date +%Y).pdf https://www.evides.nl/-/media/files/waterkwaliteit/evides-waterkwaliteit-$i.pdf
done
