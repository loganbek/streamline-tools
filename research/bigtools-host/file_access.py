import os.path
import json
import logging

class FileAccess:

    def __init__(self, params):
        # initialize logging
        tmpdir = os.path.expanduser('~') + '/.bigtools'
        logging.basicConfig(filename=tmpdir + '/bigtools_host.log', 
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', 
            level=logging.DEBUG)
        try:
            self.action = params["action"]
            self.project_root = params["projectRoot"]
            self.host_name = params["hostName"]
            self.file_content = ""
            if (self.action != "load_code"):
                self.file_content = params["fileContent"]
            self.file_group = params["fileGroup"]
            self.file_extension = params["fileExtension"]
            self.id = params["id"]
            # self.process_id = params["processId"]
            self.var_name = params["varName"]
            self.valid = True
            self.append_id = params["appendId"]
        except:
            logging.error("Missing expected params. Request must have 'action', 'projectRoot', 'hostName', 'fileContent', 'fileExtension, 'id', 'varName', and 'appendId'")
            logging.error(params);
            self.valid = False
            return

    def get_project_folder(self):
        project_folder = os.path.join(self.project_root, self.host_name)
        if not os.path.exists(project_folder):
            os.makedirs(project_folder)
        return project_folder

    def get_file_group_folder(self):
        file_group_folder = os.path.join(self.get_project_folder(), self.file_group)
        if not os.path.exists(file_group_folder):
            os.makedirs(file_group_folder)
        return file_group_folder

    def get_file_name(self):
        if (self.append_id):
            return self.var_name + "." + self.id + self.file_extension
        else:
            return self.var_name + self.file_extension

    def get_file_path(self):
        file_path = os.path.join(self.get_file_group_folder(), self.get_file_name())
        return file_path

    def write_to_file(self):
        with open(self.get_file_path(), 'wb') as temp_file:
            temp_file.write(self.file_content.encode('utf-8'))
        temp_file.close()

    def do_write(self):
        self.write_to_file()

    def do_read(self):
        temp_file = open(self.get_file_path(), 'r')
        self.file_content = temp_file.read()
        temp_file.close()
        # print(self.file_content)
        return self.file_content

if __name__ == "__main__":
    params = {}
    params["action"] = "save_code"
    params["projectRoot"] = "./BmProjectTest/"
    params["hostName"] = "devkronos.bigmachines.com"
    params["fileContent"] = "test"
    # params["fileGroup"] = "Libraries"
    params["fileExtension"] = ".bml"
    params["id"] = "12760574"
    params["processId"] = "-1"
    params["varName"] = "plugintest"
    params["appendId"] = "abc"
    params["fileGroup"] = "my"
    fa = FileAccess(params)
    if fa.valid == True:
        fa.do_write()

    # params["action"] = "load_code"
    # fa = FileAccess(params)
    # if fa.valid == True:
    #     fa.do_read()