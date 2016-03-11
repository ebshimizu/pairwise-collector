#!/usr/bin/env python

import argparse
import math
import sys

parser = argparse.ArgumentParser(description='Bradley-Terry-Luce label generator.')
parser.add_argument('input_path', type=str, help='Path to input file in CSV format.')
parser.add_argument('--max_iter', type=int, default=0, help='Max number of iterations before stopping.')
parser.add_argument('--min_delta', type=float, default=0.0, help='Min change in likelihood value before stopping.')
parser.add_argument('--smoothing', type=float, default=0.0, help='Laplace smoothing parameter (added to all counts).')

def read_input(path):
  with open(path,'r') as f:
    lines = f.readlines()
  for i in range(len(lines)):
    lines[i] = map(int, lines[i].split(','))
  return lines

def btl(w, max_iter, min_delta, smoothing):
  idx = range(len(w))
  w = [[w[i][j] + smoothing for j in idx] for i in idx]
  W = [0 for i in idx]
  N = [[0 for j in idx] for i in idx]
  for i in idx:
    W[i] = sum(w[i])
    for j in idx:
      N[i][j] += w[i][j]
      N[j][i] += w[i][j]
  p = [1.0 / len(idx) for i in idx]
  L = float('-inf')
  it = 0
  while True:
    if max_iter > 0 and it >= max_iter:
      break
    it += 1
    p1 = []
    for i in idx:
      p1.append(0.0)
      for j in idx:
        if i != j:
          p1[i] += N[i][j] / (p[i] + p[j])
      p1[i] = W[i] / p1[i]
    s = sum(p1)
    for i in idx:
      p[i] = p1[i] / s
    L1 = 0.0
    for i in idx:
      for j in idx:
        L1 += w[i][j] * math.log(p[i]) - w[i][j] * math.log(p[i] + p[j])
    if L1 - L < min_delta:
      break
    L = L1
    sys.stderr.write("Iterations: %d\n" % it)
    sys.stderr.write("Likelihood: %f\n" % L)
  return p

if __name__ == '__main__':
  args = parser.parse_args()
  if not (args.max_iter or args.min_delta):
    parser.error('Must specify either MAX_ITER or MIN_DELTA')
  cmps = read_input(args.input_path)
  cmps = zip(*cmps)
  p = btl(cmps, args.max_iter, args.min_delta, args.smoothing)
  for pi in p:
    print pi
