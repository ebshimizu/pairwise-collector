function [bestc, bestg, minMSE] = cross_val(label, instance, cRange, gRange)

% [label, instance] = libsvmread(['libsvm_data/', file]);
bestc = 1;
bestg = 1 / length(label);
minMSE = svmtrain(label, instance, ['-v 3 -s 4 -t 2 -q -c ', num2str(bestc), ' -g ', num2str(bestg)]);

for c = cRange
    for g = gRange
       mse = svmtrain(label, instance, ['-v 3 -s 4 -t 2 -q -c ', num2str(exp(c)), ' -g ', num2str(exp(g))]);
       if (mse < minMSE)
           bestc = exp(c);
           bestg = exp(g);
           minMSE = mse;
       end
    end 
end

end