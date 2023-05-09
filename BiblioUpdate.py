import sqlite3
import re

con = sqlite3.connect('EPYW.db')
cur = con.cursor()

cur.execute("PRAGMA foreign_keys=off;")

changeNamesToOld = "ALTER TABLE EPYW_v2 RENAME TO OLD_EPYW;"
cur.execute(changeNamesToOld)
changeNamesToOld = "ALTER TABLE PRINTS RENAME TO OLD_PRINTS;"
cur.execute(changeNamesToOld)
changeNamesToOld = "ALTER TABLE JOINED_PLACES RENAME TO OLD_JOINED_PLACES;"
cur.execute(changeNamesToOld)
changeNamesToOld = "ALTER TABLE PLACE_IDS RENAME TO OLD_PLACE_IDS;"
cur.execute(changeNamesToOld)
changeNamesToOld = "ALTER TABLE PUBLISHERS RENAME TO OLD_PUBLISHERS;"
cur.execute(changeNamesToOld)
changeNamesToOld = "ALTER TABLE PUBLISHER_IDS RENAME TO OLD_PUBLISHER_IDS;"
cur.execute(changeNamesToOld)
changeNamesToOld = "ALTER TABLE WHEN_prints RENAME TO OLD_WHEN_prints;"
cur.execute(changeNamesToOld)
changeNamesToOld = "ALTER TABLE WHERE_prints RENAME TO OLD_WHERE_prints;"
cur.execute(changeNamesToOld)
changeNamesToOld = "ALTER TABLE WHO RENAME TO OLD_WHO;"
cur.execute(changeNamesToOld)
changeNamesToOld = "ALTER TABLE WHO_IDS RENAME TO OLD_WHO_IDS;"
cur.execute(changeNamesToOld)
changeNamesToOld = "ALTER TABLE YEAR_IDS RENAME TO OLD_YEAR_IDS;"
cur.execute(changeNamesToOld)
changeNamesToOld = "ALTER TABLE NEW_EPYW RENAME TO EPYW_v2;"
cur.execute(changeNamesToOld)

prints_query = 'SELECT Key, Author, Title, Editor, Publisher FROM EPYW_v2;'
cur.execute(prints_query)
prints_data = cur.fetchall()


#CREATE TABLE PRINTS
tbl_prints = '''CREATE TABLE PRINTS(
    Key TEXT PRIMARY KEY,
    Author TEXT,
    Title TEXT,
    Editor TEXT,
    Publisher TEXT
);'''
cur.execute(tbl_prints)


for d in prints_data:
    sql_cmd = 'INSERT INTO PRINTS VALUES ("{}","{}","{}","{}","{}");'.format(d[0],d[1],d[2],d[3],d[4])
    cur.execute(sql_cmd)


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




#CREATE TABLE who_ids

tbl_who_ids = '''CREATE TABLE WHO_IDS(
    ID_WHO INTEGER PRIMARY KEY AUTOINCREMENT,
    NAME TEXT
);'''
cur.execute(tbl_who_ids)

for person in who_set:
    sql_cmd = 'INSERT INTO WHO_IDS(NAME) VALUES ("{}");'.format(person)
    cur.execute(sql_cmd)

tbl_who = '''CREATE TABLE WHO(
    Key TEXT,
    NAME TEXT,
    ID_WHO INTEGER,
    FOREIGN KEY (Key) REFERENCES PRINTS(Key)
    FOREIGN KEY (ID_WHO) REFERENCES WHO_IDS(ID_WHO) 
);'''
cur.execute(tbl_who)

for k,v in dic_work_who.items():
    for person in v:
        sql_cmd = 'INSERT INTO WHO(Key, NAME) VALUES ("{}", "{}");'.format(k,person)
        cur.execute(sql_cmd)

update_who_sql = '''UPDATE WHO
    SET ID_WHO = WHO_IDS.ID_WHO
    FROM WHO_IDS
    WHERE WHO_IDS.name = WHO.name;'''
cur.execute(update_who_sql)

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

update_publ_sql = '''UPDATE PUBLISHERS
    SET ID_PUBLISHER = PUBLISHER_IDS.ID_PUBLISHER
    FROM PUBLISHER_IDS
    WHERE PUBLISHER_IDS.name = PUBLISHERS.name;'''

cur.execute(update_publ_sql)

#CREATE TABLE YEAR_ids
years_sql = '''CREATE TABLE YEAR_IDS(
	    ID_YEAR INTEGER PRIMARY KEY AUTOINCREMENT,
	    YEAR INTEGER
    );'''
cur.execute(years_sql)

years_sql= '''INSERT INTO YEAR_IDS(YEAR)
    SELECT DISTINCT PublicationYear
    FROM EPYW_v2;'''
cur.execute(years_sql)

years_sql= '''CREATE TABLE WHEN_prints(
        Key TEXT,
        YEAR INTEGER,
        ID_YEAR INTEGER,
        FOREIGN KEY (Key) REFERENCES PRINTS(Key)
        FOREIGN KEY (ID_YEAR) REFERENCES YEAR_IDS(ID_YEAR)

    );'''
cur.execute(years_sql)

years_sql = '''INSERT INTO WHEN_prints
    SELECT EPYW_v2.Key, EPYW_v2.PublicationYear, YEAR_IDS.ID_YEAR
    FROM EPYW_v2 JOIN YEAR_IDS ON EPYW_v2.PublicationYear=YEAR_IDS.YEAR
    WHERE EPYW_v2.PublicationYear;'''
cur.execute(years_sql)

#CREATE TABLE PLACE_IDS

places_sql = '''CREATE TABLE PLACE_IDS(
	    ID_PLACE INTEGER PRIMARY KEY AUTOINCREMENT,
	    PLACE_STR TEXT,
        LATITUDE REAL,
        LONGITUD REAL
    );'''
cur.execute(places_sql)

places_sql= '''INSERT INTO PLACE_IDS(PLACE_STR)
    SELECT DISTINCT Place
    FROM EPYW_v2;'''
cur.execute(places_sql)

tbl_where = '''CREATE TABLE WHERE_prints(
    Key TEXT,
    PLACE_STR TEXT,
    ID_PLACE INTEGER,
    FOREIGN KEY (Key) REFERENCES PRINTS(Key)
    FOREIGN KEY (ID_PLACE) REFERENCES PLACE_IDS(ID_PLACE)

);
'''
cur.execute(tbl_where)

tbl_where = '''CREATE TABLE JOINED_PLACES(
    ID_PLACE INTEGER,
    PLACE_STR TEXT,
    ID_REF INTEGER

);
'''
cur.execute(tbl_where)

places_sql = "SELECT ID_PLACE, PLACE_STR FROM PLACE_IDS;"
cur.execute(places_sql)
places_sql = cur.fetchall()

for key, pstr in places_sql:
    if pstr and re.search('[/,;]', pstr):
        places = re.split('[/,;]', pstr)
        places = [re.sub('^\s', '', re.sub('\s$', '', pl)) for pl in places]
        for pl in places:
            pl_querysql = 'SELECT ID_PLACE FROM PLACE_IDS WHERE PLACE_STR="{}";'.format(pl)
            cur.execute(pl_querysql)
            pl_query = cur.fetchone()
            if not pl_query:
                insert_id = 'INSERT INTO PLACE_IDS(PLACE_STR) VALUES ("{}");'.format(pl)
                cur.execute(insert_id)
                cur.execute(pl_querysql)
                pl_query = cur.fetchone()
            insert_join = 'INSERT INTO JOINED_PLACES VALUES({},"{}",{});'.format(key, pstr, str(pl_query[0]))
            cur.execute(insert_join)



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
                cur.execute(insert)
        else:
            #print(id_place)
            insert = 'INSERT INTO WHERE_prints(Key, ID_PLACE) VALUES ("{}", {});'.format(key,str(id_place))
            cur.execute(insert)

        
        #print(id_place)
    
     


update_tblwhere ='''UPDATE WHERE_prints
    SET PLACE_STR = PLACE_IDS.PLACE_STR
    FROM PLACE_IDS
    WHERE PLACE_IDS.ID_PLACE = WHERE_prints.ID_PLACE;'''
cur.execute(update_tblwhere)

update_tblplaceids = '''UPDATE PLACE_IDS
    SET LATITUDE = OLD_PLACE_IDS.LATITUDE, LONGITUD = OLD_PLACE_IDS.LONGITUD
    FROM OLD_PLACE_IDS
    WHERE OLD_PLACE_IDS.PLACE_STR = PLACE_IDS.PLACE_STR;'''
cur.execute(update_tblplaceids)

deleteold = "DROP TABLE IF EXISTS OLD_JOINED_PLACES;"
cur.execute(deleteold)
deleteold = "DROP TABLE IF EXISTS OLD_PLACE_IDS;"
cur.execute(deleteold)
deleteold = "DROP TABLE IF EXISTS OLD_PUBLISHERS;"
cur.execute(deleteold)
deleteold = "DROP TABLE IF EXISTS OLD_PUBLISHER_IDS;"
cur.execute(deleteold)
deleteold = "DROP TABLE IF EXISTS OLD_WHEN_prints;"
cur.execute(deleteold)
deleteold = "DROP TABLE IF EXISTS OLD_WHERE_prints;"
cur.execute(deleteold)
deleteold = "DROP TABLE IF EXISTS OLD_WHO;"
cur.execute(deleteold)
deleteold = "DROP TABLE IF EXISTS OLD_WHO_IDS;"
cur.execute(deleteold)
deleteold = "DROP TABLE IF EXISTS OLD_YEAR_IDS;"
cur.execute(deleteold)
deleteold = "DROP TABLE IF EXISTS OLD_PRINTS;"
cur.execute(deleteold)
deleteold = "DROP TABLE IF EXISTS OLD_EPYW;"
cur.execute(deleteold)

cur.execute("PRAGMA foreign_keys=off;")
con.commit()
con.close()

