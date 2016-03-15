function [ ] = select_samples( labels, pred, out_dir, maxElems)
%SELECT_SAMPLES Saves a list of IDs for further sampling

elems = 1:size(labels, 1);

if (size(labels, 1) >= maxElems)
    [~, I] = sort(abs(labels - pred));
    sortElem = elems(I);
    elems = sortElem(1:maxElems);
end

csvwrite([out_dir, 'samples.csv'], elems');

end

