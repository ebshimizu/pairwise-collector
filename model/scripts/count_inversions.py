#!/usr/bin/env python

def count_inversions(vals):
  count = 0
  for i in xrange(len(vals)):
    for j in xrange(i+1, len(vals)):
      if vals[i] > vals[j]:
        count += 1
  return count

if __name__ == '__main__':
  import argparse
  
  parser = argparse.ArgumentParser(description='Counts number of inversions in list of floats.')
  parser.add_argument('input_file', type=str, help='Input file containing a newline separated list of floats.')
  args = parser.parse_args()
  with open(args.input_file, 'r') as f:
    vals = map(float, f.readlines())
  count = count_inversions(vals)
  print 'Total number of inversions: %d' % count
  print 'Average inversions per element: %.2f' % (float(count) * 2.0 / len(vals))
