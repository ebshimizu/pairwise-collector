function [ ] = save_svm_stats(label, model, test_label, test_instance, test_idx, train_idx, seed, libsvm_args, model_name)
%SAVE_SVM_STATS Saves accuracy and test and training set data to a file
[pred, accuracy, prob] = svmpredict(test_label, test_instance, model);

filename = [model_name, '_stats.txt'];
fileID = fopen(filename,'w');
fprintf(fileID, 'Stats for model %s\n', model_name);
fprintf(fileID, 'libsvm args: %s\n', libsvm_args);
fprintf(fileID, 'Mean Squared Error = %f\n', accuracy(2));
fprintf(fileID, 'Squared Correlation Coefficient = %f\n', accuracy(3));
fprintf(fileID, 'Random Seed: %g\n', seed);
fprintf(fileID, 'Trained on: ');
fprintf(fileID, '%g ', sort(train_idx));
fprintf(fileID, '\n\n Test Results\n%4s %10s %10s\n', 'ID', 'Attr', 'Actual');
tData = [test_idx; pred.'; label(test_idx).'];
fprintf(fileID, '%4g %10.6f %10.6f\n', tData);

end

