function [ model ] = create_model(libsvm_args, holdout_percent, seed, model_name, dir_prefix, attr_name)
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

% load data
original_labels = csvread(['../labels/', model_name, '.csv']);
instance = csvread(['../features/', model_name, '_features.csv']);

% normalize labels
% original_labels = log(original_labels);
original_labels = original_labels - min(original_labels);
original_labels = original_labels / max(original_labels);

% labels = original_labels(2:size(original_labels, 1));

c = ags1(libsvm_args, model_name, 5, original_labels, instance);
libsvm_args = [libsvm_args, ' -c ', num2str(c)];

[model, trl, tri, tel, tei, train_idx, test_idx] = random_split(original_labels, instance, libsvm_args, holdout_percent, seed);
svm_savemodel(model, [dir_prefix, model_name, '.svm']);
save_svm_stats(original_labels, model, tel, tei, test_idx, train_idx, seed, libsvm_args, [dir_prefix, model_name]);
create_webpage(original_labels, instance, model, test_idx, train_idx, libsvm_args, model_name, dir_prefix, seed, attr_name, original_labels(1));

% select some elements for further sampling.
pred = svmpredict(original_labels, instance, model);
select_samples(original_labels, pred, dir_prefix, model_name, 25);

%sorted_images(labels, instance, model, 10, [dir_prefix, model_name]);
%sorted_images_novel(labels, instance, model, test_idx, 10, [dir_prefix, model_name]);

end
