FROM python:3
RUN apt update && apt install -y git
RUN apt install -y make && apt install -y build-essential
RUN git clone https://github.com/h3ssto/ddueruem.git
WORKDIR ddueruem/
RUN pip install -r requirements_min.txt
COPY entrypoint.sh entrypoint.sh
CMD ["./entrypoint.sh"]
