function [model, train_label, train_instance, test_label, test_instance, train_idx, test_idx] = random_split(label, instance, params, holdout_percent, seed)

rng(seed); % For repeatability. Change as needed.

r = randperm(size(label,1));
lim = int64(holdout_percent * size(label, 1));

train_idx = r(1:lim);
test_idx = r((lim + 1):size(label,1));
train_label = label(train_idx);
train_instance = instance(train_idx,:);
test_label = label(test_idx);
test_instance = instance(test_idx,:);

model = svmtrain(train_label, train_instance, params);

end