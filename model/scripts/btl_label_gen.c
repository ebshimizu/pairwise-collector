#include <assert.h>
#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_ELEMENTS 30000
#define MAX_LINE (MAX_ELEMENTS * 16)

int main(int argc, char *argv[]) {
  if (argc < 4) {
    fprintf(stderr, "Usage: ./btl_label_gen [input_file] [num_iters] [smoothing]\n");
    exit(1);
  }

  char *input_path = argv[1];
  int num_iters = atoi(argv[2]);
  float smoothing = atof(argv[3]);
  
  char *line = (char*) malloc(MAX_LINE * sizeof(char));
  int **cmps = (int**) malloc(MAX_ELEMENTS * sizeof(int*));
  FILE *fp = fopen(input_path, "r");
  int elem = 0;
  int num_elements = 0x7FFFFFFF;
  while(elem < num_elements) {
    fgets(line, MAX_LINE, fp);
    int elems = 1;
    int i = 0;
    while(line[i]) {
      if(line[i] == ',') {
        elems ++;
      }
      i ++;
    }
    if (elem == 0) {
      num_elements = elems;
    } else {
      assert(elems == num_elements);
    }
    cmps[elem] = (int*) malloc(elems * sizeof(int));
    char *pch = strtok(line, ",");
    i = 0;
    while(pch) {
      cmps[elem][i] = atoi(pch);
      i ++;
      pch = strtok(NULL, ",");
    }
    elem ++;
  }
  fclose(fp);

  int i, j;
  float **w = (float**) malloc(num_elements * sizeof(float*));
  float **N = (float**) malloc(num_elements * sizeof(float*));
  float *W = (float*) malloc(num_elements * sizeof(float));
  float *p = (float*) malloc(num_elements * sizeof(float));
  float *p1 = (float*) malloc(num_elements * sizeof(float));
  float L;
  float s;
  for (i = 0; i < num_elements; i ++) {
    w[i] = (float*) malloc(num_elements * sizeof(float));
    N[i] = (float*) malloc(num_elements * sizeof(float));
    W[i] = 0.0;
    p[i] = 1.0 / num_elements;
    p1[i] = 0.0;
    for (j = 0; j < num_elements; j ++) {
      w[i][j] = cmps[j][i] + smoothing;
      N[i][j] = 0.0;
    }
  }
  for (i = 0; i < num_elements; i ++) {
    for (j = 0; j < num_elements; j ++) {
      W[i] += w[i][j];
      N[i][j] += w[i][j];
      N[j][i] += w[i][j];
    }
  }

  int iter;
  for (iter = 0; iter < num_iters; iter ++) {
    s = 0.0;
    for (i = 0; i < num_elements; i ++) {
      p1[i] = 0.0;
      for (j = 0; j < num_elements; j ++) {
        if (i != j) {
          p1[i] += N[i][j] / (p[i] + p[j]);
        }
      }
      p1[i] = W[i] / p1[i];
      s += p1[i];
    }
    for (i = 0; i < num_elements; i ++) {
      p[i] = p1[i] / s;
    }
    L = 0.0;
    for (i = 0; i < num_elements; i ++) {
      for (j = 0; j < num_elements; j ++) {
        L += w[i][j] * log(p[i]) - w[i][j] * log(p[i] + p[j]);
      }
    }
    fprintf(stderr, "Iterations: %d\n", iter + 1);
    fprintf(stderr, "Likelihood: %f\n", L);
  }

  for (i = 0; i < num_elements; i ++) {
    fprintf(stdout, "%e\n", p[i]);
  }
}
