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
json_file = open('master_list.data.json', 'wt')

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
            if col:
                try:
                    col = int(col) #try parsing an integer
                except ValueError:
                    col = col
                row_data.append(col)
            colnum += 1

        #get last row or create one if no data translated yet
        genus = False
        #find genus
        if len(data) != 0:
            i = len(data) - 1 #get last one
            while i >= 0:
                taxon = data[i][2].split()
                if len(taxon) == 1 and taxon[0] == row_data[2].split()[0]: #does first part of sci name match 
                    #check if same informal group
                    if data[i][1] == row_data[1]:
                        genus = data[i] #current row_data will be attached to this one
                    i = i - 1
                else:
                    break

        #check if there is a genus to attach current row
        if genus: 
            #remove genus from species name
            if (len(row_data[2].split()) == 1):
                print ('Warning! Adding genus to genus: ' + row_data[2])
                continue
            else:
                row_data[2] = row_data[2].split(' ', 1)[1]
            #remove species group
            del row_data[1]

            #add to previous genus
            species_array_index = 3
          
            #make space for row in a genus
            try:
                #check if genus has a common name 
                if not isinstance(genus[species_array_index], (list)):
                    species_array_index = species_array_index + 1
                #check if genus has a synonym
                if not isinstance(genus[species_array_index], (list)):
                    species_array_index = species_array_index + 1

                genus[species_array_index]
            except:
                genus.append([])

            #add row to genus
            try:
                genus[species_array_index].append(copy.copy(row_data))
            except AttributeError:
                print(genus)
        else:
            #add to all row data
            if (len(row_data[2].split()) == 2 and row_data[2].split()[0] != 'X'):
                print ('Warning! Species without genus: ' + row_data[2])
            else:
                data.append(copy.copy(row_data))
    rownum += 1
    
json_file.write(json.dumps(data,separators=(',', ':')))

csv_file.close()
json_file.close()
