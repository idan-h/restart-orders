import oracledb


class OracleDB:
    def __init__(self, user, password, dsn):
        self.user = user
        self.password = password
        self.dsn = dsn
        self.connection = None

    def connect(self):
        self.connection = oracledb.connect(
            user=self.user,
            password=self.password,
            dsn=self.dsn
        )

    def execute(self, sql , parms=None, return_rows = False, commit = True):
        with self.connection.cursor() as cursor:
            print("sending sql query ... ")
            c = cursor.execute(sql) if parms is None else cursor.execute(sql, parms)
            if commit:
                self.connection.commit()
            if return_rows:
                return c.fetchall()
            

    def __del__(self):
        if self.connection:
            self.connection.close()


