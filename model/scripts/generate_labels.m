function [ ] = generate_labels( data_path, output_path )
%GENERATE_LABELS Generates labels from an input CSV document
% Uses map estimation by default. Labels are unscaled after generation.

data = csvread(data_path);
labels = scale_map(data');
csvwrite(labels, output_path);

end

