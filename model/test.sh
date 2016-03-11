#!/bin/bash

while read -r line; do
	scp -i ~/.ssh/id_rsa "$line-2015-05-04-12-52.html" eshimizu@pike.graphics.cs.cmu.edu:"/usr0/www-graphics/projects/lighting/collector/client/results/$(printf %q "$line")-2015-05-04-12-52.html"
done <<< "$(cat ../raw_data/attributes.txt)"
