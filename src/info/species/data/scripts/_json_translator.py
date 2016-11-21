#!/usr/bin/python

# Transforms a CSV file into a JSON file
# eg.
# A, B, C[], C[], C[], D[], E{A}, E{B}
#
# {A, B, [C, C, C], [D], E:{A, B}}
import logging
logging.basicConfig(filename='warnings.log',level=logging.DEBUG)

import csv
import json
import copy

import pdb

def split_row(row):
    data = []
    #for each column in row
    for col in row:
        if col: # don't add empty
            try:
                col = int(col) #try parsing an integer
            except ValueError:
                col = col
            data.append(col)
    return data

def process_row(data, row, header):
    row_data = split_row(row)

    colnum = 0
    row_data = {}
    for col in row:
        key = header[colnum]
        array = key.find('[]')
        object = key.find('{')

        #translate digits
        if col.replace('.','',1).isdigit():
            try:
                col = int(col)
            except ValueError:
                col = float(col)

        #check if the col name is array
        if array != -1:
            key = key[:array] #crop the []
            try:
                row_data[key]
            except KeyError:
                row_data[key] = []
            if col:
                row_data[key].append(col)

        #check if the col name is object
        elif object != -1:
            object_key = key[:object] #crop the {xx}
            inner_object_key = key[object + 1 : -1] #extract XX from {xx}
            try:
                row_data[object_key]
            except KeyError:
                row_data[object_key] = {}
            row_data[object_key][inner_object_key] = col

        else:
            row_data[key] = col
        colnum += 1
    data.append(copy.copy(row_data))
        

def run(input_filename, output_filename):
    csv_file = open(input_filename, 'rt')
    reader = csv.reader(csv_file)
   
    # scan file
    data = []
    row_data = {}
    header = None
    for row in reader:
        if not header:
            #initial header saving
            header = row
        else:
            process_row(data, row, header)
     
    # logging.debug out    
    json_file = open(output_filename, 'wt')
    # json_file.write(json.dumps(data,separators=(',', ':')))
    json_file.write(json.dumps(data, indent=4, separators=(',', ': ')))

    csv_file.close()
    json_file.close()