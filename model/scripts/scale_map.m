function [ S ] = scale_map( counts )
%SCALE_MAP From How To Analyze Paired Comparison Data
% Function written by Kristi Tsukida

prior_sigma = 1;
[m, nm] = size(counts);
assert(m == nm, 'counts must be a square matrix');
counts(eye(m) > 0) = 0;

%previous_quiet = cvx_quiet(1);
cvx_begin
    variables S(m,1) t;
    SS = repmat(S, 1, m);
    delta = SS - SS';
    
    minimize(t);
    subject to
    -sum(sum(counts.*log_normcdf(delta))) + sum(square(S))/(2*prior_sigma) <= t
    sum(S) == 0
cvx_end


end

