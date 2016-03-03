function [ output_args ] = create_webpage(labels, instance, model, test_idx, train_idx, libsvm_args, model_name, dir_prefix, seed, attr_name, thresh )
%CREATE_WEBPAGE Outputs a webpage that displays the results of the
% regression.

[pred, accuracy, prob] = svmpredict(labels, instance, model);

filename = [dir_prefix, model_name, '.html'];
fileID = fopen(filename,'w');

title = [model_name, ' ', libsvm_args, ' (', int2str(seed), ')'];

% header
fprintf(fileID, '<html>\n\t<head>\n\t\t<script src="http://code.jquery.com/jquery-1.11.2.min.js"></script>\n\t\t<script src="https://cdn.socket.io/socket.io-1.3.4.js"></script>\n\t\t<script src="http://cdnjs.cloudflare.com/ajax/libs/jquery.isotope/2.2.0/isotope.pkgd.js"></script>\n\t\t<script type="text/javascript" src="../jquery-ui/jquery-ui.min.js"></script>\n\t\t<script type="text/javascript" src="imagesloaded.pkgd.min.js"></script>\n\t\t<script type="text/javascript" src="results.js"></script>\n\t\t<link rel="stylesheet" type="text/css" href="../style.css" />\n\t\t<link rel="stylesheet" type="text/css" href="../jquery-ui/jquery-ui.css" />\n\t\t<link rel="stylesheet" type="text/css" href="../jquery-ui/jquery-ui.structure.css" />\n\t\t<link rel="stylesheet" type="text/css" href="../jquery-ui/jquery-ui.theme.css" />\n\t\t<title>%s</title>\n\t</head>\n\t<body attr-name="%s">\n\t\t<div id="controls">\n\t\t\t<div class="title">%s</div>\n\t\t\t<a href="#" id="reset">Reset</a>\n\t\t\t<div class="filter">\n\t\t\t\t<span class="subtitle">Filter:</span>\n\t\t\t\t<form>\n\t\t\t\t\t<div id="filterButtons">\n\t\t\t\t\t\t<input type="radio" id="none" data-filter-by="*" name="radio"><label for="none">None</label>\n\t\t\t\t\t\t<input type="radio" id="train" data-filter-by=".train" name="radio"><label for="train">Train</label>\n\t\t\t\t\t\t<input type="radio" id="test" data-filter-by=".test" name="radio" checked="checked"><label for="test">Test</label>\n\t\t\t\t\t\t<input type="radio" id="pthresh" data-filter-by="pthresh" name="radio"><label for="pthresh">P. Threshold</label>\n\t\t\t\t\t\t<input type="radio" id="lthresh" data-filter-by="lthresh" name="radio"><label for="lthresh">L. Threshold</label>\n\t\t\t\t\t</div>\n\t\t\t\t</form> \n\t\t\t</div>\n\t\t\t<div class="sort">\n\t\t\t\t<span class="subtitle">Sort:</span>\n\t\t\t\t<form>\n\t\t\t\t\t<div id="sortButtons">\n\t\t\t\t\t\t<input type="radio" id="pred" data-sort-by="pred" name="radio" checked="checked"><label for="pred">Predicted</label>\n\t\t\t\t\t\t<input type="radio" id="label" data-sort-by="label" name="radio"><label for="label">Actual</label>\n\t\t\t\t\t\t<input type="radio" id="id" data-sort-by="id" name="radio"><label for="id">ID</label>\n\t\t\t\t\t</div>\n\t\t\t\t</form>\n\t\t\t</div>\n\t\t\t<div class="display">\n\t\t\t\t<span class="subtitle">Display:</span>\n\t\t\t\t<div id="displayButtons">\n\t\t\t\t\t<input type="checkbox" id="showid" display=".id-label"><label for="showid">ID</label>\n\t\t\t\t\t<input type="checkbox" id="showlabel" display=".label-label"><label for="showlabel">Label</label>\n\t\t\t\t\t<input type="checkbox" id="showpred" display=".pred-label"><label for="showpred">Score</label>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\n\t\t<div id="results">\n', title, attr_name, title);
fprintf(fileID, '\t\t<div id="threshold" threshold="%.6f"></div>\n', thresh);
% elements
for i = 1:size(labels,1)
    fprintf(fileID, '\t\t<div class="item ');
    
    % Filter train vs test
    if (sum(ismember(i, test_idx)) > 0)
       fprintf(fileID, 'test');
    else    
       fprintf(fileID, 'train');
    end
    
    fprintf(fileID, '" exid="%g" label="%.6f" pred="%.6f">\n', i, labels(i), pred(i));
    fprintf(fileID, '\t\t\t<div class="id-label">%g</div>\n\t\t\t<div class="label-label">%.6f</div>\n\t\t\t<div class="pred-label">%.6f</div>\n',i, labels(i), pred(i));
    fprintf(fileID, '\t\t\t<img src="http://graphics.cs.cmu.edu/projects/lighting/collector/client/thumbs/%g.png" />\n', i);
    fprintf(fileID, '\t\t\t<div class="compFor"></div>\n\t\t\t<div class="compAgainst"></div>\n\t\t</div>\n');
end

% footer
fprintf(fileID, '\t\t</div>\n\t</body>\n</html>');
end

