from datetime import datetime
import os
import config
from .IO import format, bulk_format, timestamp

logger = None

LL_ALL = 4
LL_INFO = 3
LL_WARNING = 2
LL_ERROR = 1
LL_OFF = 0

def init(ll_vol, ll_per):
    Logger(ll_vol, ll_per)

def highlight(x):
    return f"$${x}$$"

def get_logger():
    if logger:
        return logger
    else:
        return Logger()

def log(*msgs):
    get_logger().log(*msgs)

def info(*msgs):
    get_logger().info(*msgs)

def warning(*msgs):
    get_logger().warning(*msgs)

def error(*msgs):
    get_logger().error(*msgs)

def vspace():
    get_logger().vspace()

class Logger:
    def __init__(self, ll_vol=config.LL_VOLATILE_DEFAULT, ll_per=config.LL_PERSISTENT_DEFAULT):
        global logger
        logger = self

        if ll_vol > 0:
            logfile = f"{config.LOG_DIR}/log-{timestamp('-', '-')}.log"
            
            with open(logfile, "w+") as file:
                pass

            self.logfile = logfile

        self.ll_vol = ll_vol
        self.ll_per = ll_per

    def log(self, *msgs):
        if self.ll_per >= LL_ALL:
            self.write_log_to_file(timestamp(), "[#]", bulk_format(*msgs))

        if self.ll_vol >= LL_ALL:
            print(bulk_format(*msgs, color = "green"))

    def info(self, *msgs, sep = " "):

        if self.ll_per >= LL_INFO and logger:
            self.write_log_to_file(timestamp(), "[I]", bulk_format(*msgs))

        if self.ll_vol >= LL_INFO:
            print(bulk_format(*msgs, color = "blue", str_sep = sep))

    def warning(self, *msgs):

        if self.ll_per >= LL_WARNING and logger:
            self.write_log_to_file(timestamp(), "[W]", bulk_format(*msgs))

        if self.ll_vol >= LL_WARNING:
            print(format("Warning", color = "red", attrs = ["bold"]), bulk_format(*msgs, color = "red"))


    def error(self, *msgs, error_code = 1, resilient = False):

        if self.ll_per >= LL_ERROR and logger:
            self.write_log_to_file(timestamp(), "[W]", bulk_format(*msgs))

        print()
        print(format("ERROR", color = "red", bg = "on_white", attrs = ["bold"]), bulk_format(*msgs, color = "red"))
        print()

        # TODO: What calls are resilient?
        if not resilient:
            exit(error_code)

    def vspace(self):
        if self.ll_vol > LL_WARNING:
            print()

    def write_log_to_file(self, *msgs):
        with open(self.logfile, "a") as file:
            if len(msgs) == 1:
                file.write(msgs[0])
            else:
                file.write(" ".join(msgs))

            file.write(os.linesep)
