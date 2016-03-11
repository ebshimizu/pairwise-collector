function [ ] = eval_model( model )
%EVAL_MODEL Generates figures to analyze effectiveness of model

w = abs(model.sv_coef' * full(model.SVs));
names = { 'front_intens', 'front_x', 'front_y', 'fl_intens', 'fl_x', 'fl_y', 'fr_intens', 'fr_x', 'fr_y', 'top_intens', 'top_x', 'top_y', 'hsl_intens', 'hsl_x', 'hsl_y', 'hsr_intens', 'hsr_x', 'hsr_y', 'back_intens', 'back_x', 'back_y', 'br_intens', 'br_x', 'br_y', 'bl_intens', 'bl_x', 'bl_y', 'sl_intens', 'sl_x', 'sl_y', 'sr_intens', 'sr_x', 'sr_y', 'lf_intens', 'lf_x', 'lf_y', 'lb_intens', 'lb_x', 'lb_y' };
idx = 1:1:39;
wi = [idx;w]';

wi = sortrows(wi, -2);
snames = names(wi(:,1));

bar(wi(:,2));
set(gca, 'Xtick',1:1:39);
set(gca,'XTickLabel',snames);

end

