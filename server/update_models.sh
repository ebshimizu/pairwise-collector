#!/bin/bash

NOW=$(date +"%Y-%m-%d-%H-%M")
features=$1


echo Retrieving new label data...

cd raw_data

while read -r line; do
	echo Retrieving $line.csv
	wget "http://graphics.cs.cmu.edu/projects/lighting/collector/server/out/$line.csv"
	mv "./$line.csv" "./$line-$NOW.csv"
done <<< "$(cat attributes.txt)"

echo Processing labels...

cd ../

while read -r line; do
	echo Generating labels for $line
	scripts/btl_label_gen.out "raw_data/$line-$NOW.csv" 100 0.001 > "labels/$line-$NOW.csv"
done <<< "$(cat raw_data/attributes.txt)"

echo Generating models...

cd scripts

while read -r line; do
	echo Generating models for $line
	matlab -r "try; create_model('-s 4 -t 0', 0.8, 69124, '$line-$NOW', '../results/', '$line', '$features'); create_gaussian_model('-s 4 -t 2', 0.8, 69124, '$line-$NOW', '../results/', '$line', '$features'); catch; end; quit"
done <<< "$(cat ../raw_data/attributes.txt)"

cd ../results

echo Publishing results...

echo "<h3>$NOW - $features</h3>" >> index.html

while read -r line; do
	scp -i ~/.ssh/id_rsa "$line-$NOW.html" eshimizu@pike.graphics.cs.cmu.edu:"/usr0/www-graphics/projects/lighting/collector/client/results/$(printf %q "$line")-$NOW.html"
	echo "<a href='$line-$NOW.html'>$line-$NOW</a><br />" >> index.html 
	scp -i ~/.ssh/id_rsa "$line-$NOW-g.html" eshimizu@pike.graphics.cs.cmu.edu:"/usr0/www-graphics/projects/lighting/collector/client/results/$(printf %q "$line")-$NOW-g.html"
	echo "<a href='$line-$NOW-g.html'>$line-$NOW-g</a><br />" >> index.html 
done <<< "$(cat ../raw_data/attributes.txt)"

scp -i ~/.ssh/id_rsa "index.html" eshimizu@pike.graphics.cs.cmu.edu:"/usr0/www-graphics/projects/lighting/collector/client/results/index.html"
