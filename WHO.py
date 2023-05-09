import sqlite3
import re

con = sqlite3.connect('EPYW.db')
cur = con.cursor()
"""
who_query = 'SELECT Key, Author, Editor FROM EPYW_v2;'
cur.execute(who_query)
who_list = cur.fetchall()

dic_work_who = {}
for who in who_list:
    key = who[0]
    author = who[1]
    editor = who[2]
    if editor and ';' in editor:
        multiple_who = [re.sub('^\s', '', re.sub('\s$', '', name)) for name in editor.split(';')]
        dic_work_who[key] = multiple_who
    elif editor:
        dic_work_who[key] = [editor]
        #print(editor)
    elif author and ';' in author:
        multiple_who = [re.sub('^\s', '', re.sub('\s$', '', name)) for name in author.split(';')]
        dic_work_who[key] = multiple_who
        
    elif author:
        dic_work_who[key] = [author]
who_set = set()
for k, v in dic_work_who.items():
    for w in v:
        who_set.add(w)

for person in who_set:
    print(person)

        #print(multiple_who)
"""
"""
#CREATE TABLE PRINTS
tbl_prints = '''CREATE TABLE PRINTS(
    Key TEXT PRIMARY KEY,
    Author TEXT,
    Title TEXT,
    Editor TEXT,
    Publisher TEXT
);'''
"""
"""
#CREATE TABLE who_ids

tbl_who_ids = '''CREATE TABLE WHO_IDS(
    ID_WHO INTEGER PRIMARY KEY AUTOINCREMENT,
    NAME TEXT
);'''
#cur.execute(tbl_who_ids)

for person in who_set:
    sql_cmd = 'INSERT INTO WHO_IDS(NAME) VALUES ("{}");'.format(person)
    #cur.execute(sql_cmd)

tbl_who = '''CREATE TABLE WHO(
    Key TEXT,
    NAME TEXT,
    ID_WHO INTEGER,
    FOREIGN KEY (Key) REFERENCES PRINTS(Key)
    FOREIGN KEY (ID_WHO) REFERENCES WHO_IDS(ID_WHO) 
);'''
#cur.execute(tbl_who)

for k,v in dic_work_who.items():
    for person in v:
        sql_cmd = 'INSERT INTO WHO(Key, NAME) VALUES ("{}", "{}");'.format(k,person)
        #cur.execute(sql_cmd)
"""
"""UPDATE WHO
SET ID_WHO = WHO_IDS.ID_WHO
FROM WHO_IDS
WHERE WHO_IDS.name = WHO.name;"""
"""
tbl_where = '''CREATE TABLE WHERE_prints(
    Key TEXT,
    PLACE_STR TEXT,
    ID_PLACE INTEGER,
    FOREIGN KEY (Key) REFERENCES PRINTS(Key)
    FOREIGN KEY (ID_PLACE) REFERENCES PLACE_IDS(ID_PLACE)

);
'''
all_places = 'SELECT Key, Place FROM EPYW_v2;'
cur.execute(all_places)
all_places = cur.fetchall()

#dic_work_where = {}

for key, place in all_places:
    if place:
        id_place = 'SELECT ID_PLACE FROM PLACE_IDS WHERE PLACE_STR="{}";'.format(place)
        cur.execute(id_place)
        id_place = cur.fetchone()[0]
        checkifjoined = 'SELECT ID_REF FROM JOINED_PLACES WHERE ID_PLACE={};'.format(str(id_place))
        cur.execute(checkifjoined)
        checkifjoined = cur.fetchall()
        if checkifjoined:
            for id_ref in checkifjoined:
                id_ref = id_ref[0]
                #print(id_ref)
                insert = 'INSERT INTO WHERE_prints(Key, ID_PLACE) VALUES ("{}", {});'.format(key,str(id_ref))
                #cur.execute(insert)
        else:
            #print(id_place)
            insert = 'INSERT INTO WHERE_prints(Key, ID_PLACE) VALUES ("{}", {});'.format(key,str(id_place))
            #cur.execute(insert)

        
        #print(id_place)
    
     
#cur.execute(tbl_where)
"""
"""UPDATE WHERE_prints
SET PLACE_STR = PLACE_IDS.PLACE_STR
FROM PLACE_IDS
WHERE PLACE_IDS.ID_PLACE = WHERE_prints.ID_PLACE;

CREATE TABLE YEAR_IDS(
	ID_YEAR INTEGER PRIMARY KEY AUTOINCREMENT,
	YEAR INTEGER
);

INSERT INTO YEAR_IDS(YEAR)
SELECT DISTINCT PublicationYear
FROM EPYW_v2;

CREATE TABLE WHEN_prints(
    Key TEXT,
    YEAR INTEGER,
    ID_YEAR INTEGER,
    FOREIGN KEY (Key) REFERENCES PRINTS(Key)
    FOREIGN KEY (ID_YEAR) REFERENCES YEAR_IDS(ID_YEAR)

);

INSERT INTO WHEN_prints
SELECT EPYW_v2.Key, EPYW_v2.PublicationYear, YEAR_IDS.ID_YEAR
FROM EPYW_v2 JOIN YEAR_IDS ON EPYW_v2.PublicationYear=YEAR_IDS.YEAR
WHERE EPYW_v2.PublicationYear;
"""
publ_query = 'SELECT Key, Publisher FROM EPYW_v2;'
cur.execute(publ_query)
publ_list = cur.fetchall()

dic_work_publ = {}
for publ in publ_list:
    key = publ[0]
    publisher = publ[1]
    if publisher and ',' in publisher:
        multiple_publisher = [re.sub('^\s', '', re.sub('\s$', '', publi)) for publi in publisher.split(',')]
        dic_work_publ[key] = multiple_publisher
    elif publisher:
        dic_work_publ[key] = [publisher]
        #print(editor)
    else:
        dic_work_publ[key] = [None]
publ_set = set()
for k, v in dic_work_publ.items():
    for w in v:
        publ_set.add(w)

for publ in publ_set:
    print(publ)

#CREATE TABLE PUBLISHER_ids

tbl_publ_ids = '''CREATE TABLE PUBLISHER_IDS(
    ID_PUBLISHER INTEGER PRIMARY KEY AUTOINCREMENT,
    NAME TEXT
);'''
cur.execute(tbl_publ_ids)

for publ in publ_set:
    sql_cmd = 'INSERT INTO PUBLISHER_IDS(NAME) VALUES ("{}");'.format(publ)
    cur.execute(sql_cmd)

tbl_publishers = '''CREATE TABLE PUBLISHERS(
    Key TEXT,
    NAME TEXT,
    ID_PUBLISHER INTEGER,
    FOREIGN KEY (Key) REFERENCES PRINTS(Key)
    FOREIGN KEY (ID_PUBLISHER) REFERENCES PUBLISHER_IDS(ID_PUBLISHER) 
);'''
cur.execute(tbl_publishers)

for k,v in dic_work_publ.items():
    for publisher in v:
        sql_cmd = 'INSERT INTO PUBLISHERS(Key, NAME) VALUES ("{}", "{}");'.format(k,publisher)
        cur.execute(sql_cmd)

"""UPDATE PUBLISHERS
SET ID_PUBLISHER = PUBLISHER_IDS.ID_PUBLISHER
FROM PUBLISHER_IDS
WHERE PUBLISHER_IDS.name = PUBLISHERS.name;"""


con.commit()
con.close()


        
