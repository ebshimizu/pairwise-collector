% Generates libsvm models for all selected data.
% Note that the cross-validated paramter values are all differernt.
dir_root = 'libsvm_data/bv_models/';
pfx = 'train_a_attr_';
data_pfx = 'train_a_attr_';
seed = 10701;

% Cross-validated values for c and gamma. Found with a hand-written grid
% search (super low tech brute force for the win)
c = [ 2.282, 0.5790, 0.4650, 0.2390, 0.188, 0.6480, 0.2460, 1.389, 2.3360, 4.0520, 0.270, 2.8000, 0.2250];
g = [ 5.287, 3.9550, 2.5770, 4.53, 75.589, 2.806, 0.3270, 0.02000, 2.5460, 1.2520, 4.389, 12.950, 6.9580];

for i = 1:13
    [model, trl, tri, tel, tei, train_idx, test_idx] = random_split([data_pfx,int2str(i)], ['-s 4 -t 2 -c ', num2str(c(i)), ' -g ', num2str(g(i))], seed);
    svm_savemodel(model, [dir_root, pfx, int2str(i)]);
    save_svm_stats(model, tel, tei, test_idx, train_idx, seed, [data_pfx, int2str(i)]);
end