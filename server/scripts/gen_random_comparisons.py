#!/usr/bin/env python

import argparse
import math
import random
import sys

def logistic(x, x0, L, k):
  return float(L) / (1.0 + math.exp(-k*(x - x0)))

parser = argparse.ArgumentParser(description='Generate random comparison matrix.')
parser.add_argument('elements', type=int, help='Number of elements to compare.')
parser.add_argument('comparisons', type=int, help='Number of comparisons to generate')
parser.add_argument('k', type=float, help='Steepness of logistic function (higher = fewer mistakes)')

if __name__ == '__main__':
  args = parser.parse_args()
  cmps = [[0] * args.elements for i in xrange(args.elements)]
  for i in xrange(args.comparisons):
    while True:
      a = random.randint(0, args.elements - 1)
      b = random.randint(0, args.elements - 1)
      if a != b:
        break
    af = float(a) / args.elements
    bf = float(b) / args.elements
    p = logistic(bf, af, 1.0, args.k)
    if random.random() < p:
      # b wins over a
      cmps[b][a] += 1
    else:
      # a wins over b
      cmps[a][b] += 1
  # transpose for output
  cmps = zip(*cmps)
  for row in cmps:
    sys.stdout.write(','.join(map(str, row)) + '\n')
