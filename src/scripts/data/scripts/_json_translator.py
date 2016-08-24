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

OUTPUT_GROUP_ID = 1
INPUT_GROUP_ID = OUTPUT_GROUP_ID

OUTPUT_TAXON_ID = 2
INPUT_TAXON_ID = OUTPUT_TAXON_ID


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

def process_row(data, row):
    row_data = split_row(row)

    #get last row or create one if no data translated yet
    genus = False
    #find genus for current row
    if len(data) != 0:
        i = len(data) - 1 #get last one
        # traverse backwards looking for genus array
        while i >= 0:
            prev_row = data[i]
            taxon = prev_row[OUTPUT_TAXON_ID].split()
            if len(taxon) == 1 and taxon[0] == row_data[INPUT_TAXON_ID].split()[0]: #has only one word that matches 
                #check if same informal group
                if prev_row[OUTPUT_GROUP_ID] == row_data[INPUT_GROUP_ID]:
                    genus = prev_row #current row_data will be attached to this one             
                i = i - 1
            else:
                break
    #check if there is a genus to attach current row
    if genus: 
        #remove genus from species name
        if (len(row_data[2].split()) == 1):
            logging.debug ('Warning! Adding genus to genus: ' + row_data[2])
            return
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
            logging.debug(genus)
    else:
        #add to all row data
        if (len(row_data[2].split()) == 2 and row_data[INPUT_TAXON_ID].split()[0] != 'X'):
            # no genus, let's make one!
            missing_genus = [
                0, # warehouse id = 0 since we don't have anny
                row_data[INPUT_GROUP_ID],
                row_data[INPUT_TAXON_ID].split()[0],
                []
            ] 
            logging.debug ('Warning! Species without genus: ' + row_data[INPUT_TAXON_ID] + ' (created ' + row_data[INPUT_TAXON_ID].split()[0] + ')' )

            row_data[INPUT_TAXON_ID] = row_data[INPUT_TAXON_ID].split()[1] # only second word
            missing_genus[3].append(copy.copy(row_data))  

            data.append(missing_genus)
        else:
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
            process_row(data, row)
     
    # logging.debug out    
    json_file = open(output_filename, 'wt')
    json_file.write(json.dumps(data,separators=(',', ':')))

    csv_file.close()
    json_file.close()