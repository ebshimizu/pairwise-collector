X=csvread('features.csv');
[coeff score] = pca(X);
biplot(coeff(:,1:2),'scores',score(:,1:2));