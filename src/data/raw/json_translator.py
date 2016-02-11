#!/usr/bin/python

# Transforms a CSV file into a JSON file
# eg.
# A, B, C[], C[], C[], D[], E{A}, E{B}
#
# {A, B, [C, C, C], [D], E:{A, B}}

import sys
import csv
import json
import copy

import pdb

csv_file = open('master_list.csv', 'rt')
reader = csv.reader(csv_file)
json_file = open('master_list.json', 'wt')

data = []
row_data = {}

rownum = 0
for row in reader:
    genus = []
    if rownum == 0:
        #initial header saving
        header = row
    else:
        #for each row
        colnum = 0
        row_data = []

        #for each column in row
        for col in row:
            key = header[colnum]
            if col:
                row_data.append(col)
            colnum += 1

        #get last row or create one if no data translated yet
        last_row = ['$'] * 4
        if len(data) != 0:
           last_row = data[len(data) - 1] #only used to check if matches with current

        #check if row belongs to previous genus
        if last_row[2].split()[0] == row_data[2].split()[0]: #does first part of sci name match 
            #remove genus from species name
            if (len(row_data[2].split()) == 1):
                print ('Warning! Adding genus to genus: ' + row_data[2])
            else:
                row_data[2] = row_data[2].split(' ', 1)[1]
            #remove species group
            del row_data[1]

            #add to previous genus
            species_array_index = 3
          
            #make space for row in a genus
            try:
                #check if genus has a common name 
                if not isinstance(last_row[species_array_index], (list)):
                    species_array_index = species_array_index + 1
                #check if genus has a synonym
                if not isinstance(last_row[species_array_index], (list)):
                    species_array_index = species_array_index + 1

                last_row[species_array_index]
            except:
                last_row.append([])

            #add row to genus
            try:
                last_row[species_array_index].append(copy.copy(row_data))
            except AttributeError:
                print(last_row)
        else:
            #add to all row data
            data.append(copy.copy(row_data))
    rownum += 1
    
json_file.write('species_list = ');
json_file.write(json.dumps(data))
json_file.write(';');

csv_file.close()
json_file.close()
