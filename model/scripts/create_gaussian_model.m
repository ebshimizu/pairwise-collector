function [ model ] = create_gaussian_model(libsvm_args, holdout_percent, seed, model_name, dir_prefix, attr_name, featureFile)
%CREATE_MODEL Generate a model from the given inputs
%   Does the following things:
%   -Creates a model using the provide command line string to libsvm
%   -Saves the model to the specified folder
%   -Saves a text file containing stats on how the model performed on the
%    holdout set
%   -Creates a webpage that arranges the examples according to the model's
%    results
%   Returns: the model

addpath('/usr2/eshimizu/attributes/libsvm/matlab');

%note that element 0 (element 1) in the labels has no features and should be excluded

original_labels = csvread(['../labels/', model_name, '.csv']);
instance = csvread(['../features/', featureFile, '.csv']);

% normalize labels
original_labels = log(original_labels);
original_labels = original_labels - min(original_labels);
original_labels = original_labels / max(original_labels);

labels = original_labels(2:size(original_labels, 1));

[c, g] = ags2(libsvm_args, model_name, 5);
libsvm_args = [libsvm_args, ' -c ', num2str(c), ' -g ', num2str(g)];

[model, trl, tri, tel, tei, train_idx, test_idx] = random_split(labels, instance, libsvm_args, holdout_percent, seed);
svm_savemodel(model, [dir_prefix, model_name, '-g.svm']);
save_svm_stats(labels, model, tel, tei, test_idx, train_idx, seed, libsvm_args, [dir_prefix, model_name, '-g']);
create_webpage(labels, instance, model, test_idx, train_idx, libsvm_args, [model_name, '-g'], dir_prefix, seed, attr_name, original_labels(1));
%sorted_images(labels, instance, model, 10, [dir_prefix, model_name]);
%sorted_images_novel(labels, instance, model, test_idx, 10, [dir_prefix, model_name]);

end
