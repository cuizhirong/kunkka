#!/bin/bash
# benchmark script
cd $(dirname $0)
cd ..

echo -e "ab -n <number of requests> -c <number of concurrency> <URL1>"

# read the number of requests from input
read -p "number of requests(press enter to use default value): " requests
if [ -z ${requests} ]
then
  echo "use default number of requests: 10000"
  requests=10000
fi

#read the number of concurrency from input
read -p "number of concurrency(press enter to use default value): " concurrency
if [ -z ${concurrency} ]
then
  echo "use default number of concurrency: 10"
  concurrency=10
fi

# read the URL from input
read -p "URL(press enter to use default value): " url
if [ -z ${url} ]
then
  echo "use default URL http://127.0.0.1:5000/"
  url="http://127.0.0.1:5000/"
fi

if test ! -d benchmark
then
  mkdir benchmark
fi

ab -n ${requests} -c ${concurrency} -g benchmark/output.tsv ${url}

echo "set terminal jpeg size 500,500
set size 1, 1
set output \"benchmark/benchmark_result.jpg\"
set title \"Benchmark testing\"
set key left top
set grid y
set xdata time
set timefmt \"%s\"
set format x \"%S\"
set xlabel 'seconds'
set ylabel \"response time (ms)\"
set datafile separator '\t'
plot \"benchmark/output.tsv\" every ::2 using 2:5 title 'response time' with points
exit" > benchmark/plot.p

## plotting
gnuplot benchmark/plot.p

## open the jped file
eog benchmark/benchmark_result.jpg > /dev/null
