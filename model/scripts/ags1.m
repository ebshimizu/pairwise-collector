function [ c ] = ags1( libsvm_args, model_name, folds, label, instance)
%AGS1 Adaptive grid search - single variable (c)
% Does a grid search for the cost param of a SVR over a logspace

%note that element 0 (element 1) in the labels has no features and should be excluded

%original_labels = csvread(['../labels/', model_name, '.csv']);
%instance = csvread('../features/features.csv');

% normalize labels
%original_labels = log(original_labels);
%original_labels = original_labels - min(original_labels);
%original_labels = original_labels / max(original_labels);

%label = original_labels(2:size(original_labels, 1));

baseopts = [libsvm_args, ' -q -v ', num2str(folds), ' -c '];
bestc = 1;
minMSE = svmtrain(label, instance, [baseopts, num2str(bestc)]);

for c = -30:1:10
    mse = svmtrain(label, instance, [baseopts, num2str(exp(c))]);
    if (mse < minMSE)
        bestc = c;
        minMSE = mse;
    end
end

% narrow down c
for c = (bestc - 1):0.1:(bestc + 1)
    mse = svmtrain(label, instance, [baseopts, num2str(exp(c))]);
    if (mse < minMSE)
        bestc = c;
        minMSE = mse;
    end
end

% narrow down again
for c = (bestc - 0.1):0.01:(bestc + 0.1)
    mse = svmtrain(label, instance, [baseopts, num2str(exp(c))]);
    if (mse < minMSE)
        bestc = c;
        minMSE = mse;
    end
end

c = exp(bestc);
