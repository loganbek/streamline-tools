import logging
import os
import sys
import struct
import json
import file_access
import subprocess
import traceback

# On Windows, the default I/O mode is O_TEXT. Set this to O_BINARY
# to avoid unwanted modifications of the input/output streams.
if sys.platform == "win32":
    import msvcrt
    msvcrt.setmode(sys.stdin.fileno(), os.O_BINARY)
    msvcrt.setmode(sys.stdout.fileno(), os.O_BINARY)

is_python_v2 = sys.version.startswith("2.")

class BigToolsHost:

    def __init__(self):
        tmpdir = os.path.expanduser('~') + '/.bigtools'
        logging.basicConfig(filename=tmpdir + '/bigtools_host.log', 
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', 
			level=logging.DEBUG)
        logging.debug("Extension Host Started using Python " + sys.version)


    def send_message(self, message):
        logging.debug(len(message))
        logging.debug(message)

        # Write message size.
        if is_python_v2:
            sys.stdout.write(struct.pack('i', len(message)))
        else:
            length_in_bytes = struct.pack('i', len(message))
            sys.stdout.write((''.join(chr(i) for i in length_in_bytes)))

        # Write the message itself.
        sys.stdout.write(message)
        sys.stdout.flush()

    def process_request(self):
        logging.debug("Start process request...")

        try:
            # Read the message length (first 4 bytes).
            text_length_bytes = sys.stdin.read(4)

            # Unpack message length as 4 byte integer.
            if not is_python_v2:
                text_length_hexstr = ""
                for c in text_length_bytes:
                    text_length_hexstr = text_length_hexstr + "{0:02x}".format(ord(c))
                text_length_bytes = bytes.fromhex(text_length_hexstr)
                logging.debug(text_length_bytes)

            # Unpack message length as 4 byte integer.
            text_length = struct.unpack('i', text_length_bytes)[0]
            logging.debug(text_length)

            # Read the text (JSON object) of the message.
            text = ""
            if is_python_v2:
                text = sys.stdin.read(text_length).decode('utf-8')
            else:
                text = sys.stdin.read(text_length)
            message = json.loads(text)
            logging.debug(message)

            if 'use_bigtoolsvs' in message and message['use_bigtoolsvs'] == True:
                self.startBigtoolsVS(message)
                self.send_message(json.dumps({'success':True})) #purposely using print to write to stdout
                return

            # write or load the content
            fa = file_access.FileAccess(message)
            statusMessage = ""
            if fa.valid == True:
                # if (message["action"] == "load_code") or (message["action"] == "load_test_code"):
                if message["action"].startswith("load_"):
                    statusMessage = "R: "
                    file_content = fa.do_read()
                    message["fileContent"] = file_content
                    message["action"] = "re" + message["action"]

                    # send a notification to Chrome reload the file/code
                    self.send_message(json.dumps(message))
                else:
                    statusMessage = "W: "
                    logging.debug(message["fileContent"])
                    fa.do_write()

                    # all done saving to file. so open it in the editor
                    subprocess.Popen([message["editor"], fa.get_file_path()])
            else:
                logging.debug("Unexpected error while writing to/reading from file.")

            logging.info(statusMessage + message['fileGroup'] + '/' + message['varName'] + message['fileExtension'])

        except Exception as e:
            logging.error(str(e))
            logging.error(traceback.format_exc())

        logging.debug("End process request!")

    def startBigtoolsVS(self, context):
        codePath = os.path.abspath(os.path.join(context['editor'],'Contents','MacOS','Electron'))
        logging.debug(codePath)
        #codePath = os.path.abspath(os.path.join(os.path.expanduser('~'), 'Applications', 'Visual Studio Code.app', 'Contents', 'MacOS', 'Electron'))
        projPath = os.path.abspath(os.path.join(context['projectRoot'],context['project'])) + '/'
        if not os.path.exists(projPath):
            os.makedirs(projPath)
        with open(os.path.join(projPath,'.bigtools-vs'),'w+') as file:
            file.write('**BigTools-VS Required File**\n DO NOT DELETE')
        logging.debug('Spawning VS Code process (%s, %s)' % (codePath, projPath))
        proc = subprocess.Popen([codePath, projPath])
        proc.wait()
        logging.debug('VS Code subprocess closed')
        #subprocess.Popen(['open', '-a',codePath,projPath + '/'],shell=True)#stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
        #output, _ = code_proc.communicate()
        #output = StringIO(output)
        #logging.debug(output)

host = BigToolsHost()
host.process_request()