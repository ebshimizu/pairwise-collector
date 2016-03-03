function [ img ] = sorted_images_novel(label, instance, model, test_idx, img_per_row, filename)

ids = 1:size(label, 1);
ids = ids.';
[pred, acc, prob] = svmpredict(label, instance, model);
vals = [ids, pred, label];
sorted = sortrows(vals, 2);

blank = zeros(540, 960, 3);

fullimg = 0;
rows = ceil(size(label, 1) / img_per_row);
cols = img_per_row;
memb = ismember(ids, test_idx);

for i = 1:rows
    imgrow = imread(['../images/', num2str(sorted((i-1) * img_per_row + 1, 1)), '.png']);
    for j = 1:cols
        id = (i - 1) * img_per_row + j + 1;
        if (id > size(label, 1))
            next = blank;
        elseif (memb(sorted(id)) == 0)
            next = blank;
        else
            next = imread(['../images/', num2str(sorted(id, 1)), '.png']);
        end
        imgrow = cat(2, imgrow, next);
    end
   
    if (fullimg == 0)
        fullimg = imgrow;
    else
        fullimg = cat(1, fullimg, imgrow);
    end
end

imshow(fullimg);
imwrite(fullimg, [ filename, '_new.png']);

img = fullimg;

end