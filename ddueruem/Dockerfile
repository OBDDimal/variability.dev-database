# syntax=docker/dockerfile:1

FROM python:3.8-slim

#install glibc and make
RUN apt-get update
RUN apt-get install make
RUN apt-get install -y gcc
RUN apt-get install -y g++

# create a virtual environment
RUN python -m venv .venv
RUN . .venv/bin/activate

# install dependencies
COPY ddueruem-2021-07 ddueruem
COPY files ddueruem/files
WORKDIR "ddueruem"
RUN pip install -r requirements_min.txt
RUN ./setup.py all
CMD ./ddueruem.py examples/sandwich.dimacs --lib buddy