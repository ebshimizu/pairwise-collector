function [ c, g ] = ags2( libsvm_args, model_name, folds )
%AGS1 Adaptive grid search - double variable (c, g)
% Does a grid search for the cost and gamma param of a gaussian SVR over a logspace

%note that element 0 (element 1) in the labels has no features and should be excluded

original_labels = csvread(['../labels/', model_name, '.csv']);
instance = csvread('../features/features.csv');

% normalize labels
original_labels = log(original_labels);
original_labels = original_labels - min(original_labels);
original_labels = original_labels / max(original_labels);

label = original_labels(2:size(original_labels, 1));

baseopts = [libsvm_args, ' -q -v ', num2str(folds), ' -c '];
bestc = 1;
bestg = 1 / size(instance, 2);
minMSE = svmtrain(label, instance, [baseopts, num2str(bestc), ' -g ', num2str(bestg)]);

for c = -20:1:3
    for g = -20:1:10
        mse = svmtrain(label, instance, [baseopts, num2str(exp(c)), ' -g ', num2str(exp(g))]);
        if (mse < minMSE)
            bestc = c;
            bestg = g;
            minMSE = mse;
        end
    end
end

% narrow down c
for c = (bestc - 0.5):0.1:(bestc + 0.5)
    for g = (bestg - 0.5):0.1:(bestg + 0.5)
        mse = svmtrain(label, instance, [baseopts, num2str(exp(c)), ' -g ', num2str(exp(g))]);
        if (mse < minMSE)
            bestc = c;
            bestg = g;
            minMSE = mse;
        end
    end
end

% narrow down again
for c = (bestc - 0.05):0.01:(bestc + 0.05)
    for g = (bestg - 0.05):0.01:(bestg + 0.05)
        mse = svmtrain(label, instance, [baseopts, num2str(exp(c)), ' -g ', num2str(exp(g))]);
        if (mse < minMSE)
            bestc = c;
            bestg = g;
            minMSE = mse;
        end
    end
end

c = exp(bestc);
g = exp(bestg);
