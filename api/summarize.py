import nltk
import spacy

nlp = spacy.load('en_core_web_sm')

def SplitSentence(sent):
    doc = nlp(sent)
    # c = 0
    # sub_toks = [tok for tok in doc if (tok.dep_ == "nsubj")]
    result = ""
    for word in doc:
        if word.dep_ == "nsubj":
            result = result + '.'
        result = result + ' ' + word.text
    if result[0] == '.':
        result = result[1:]
    if result[0] == ' ':
        result = result[1:]
    return result


def noun1(STR):
    STR = SplitSentence(STR)
    list = []
    #File = open(fileName) #open file
    #lines = File.read() #read all lines
    sentences = nltk.sent_tokenize(STR) #tokenize sentences
    noun = ''
    end_index = 0
    s = 0
    i = 1
    for sentence in sentences:
        for word,pos in nltk.pos_tag(nltk.word_tokenize(str(sentence))):
            if word == '\'ll':
                word = 'will'
            elif word == '\'re':
                word = 'are'
            elif word == '\'s':
                word = 'is'
    for sentence in sentences:
        print(sentence)
        for word,pos in nltk.pos_tag(nltk.word_tokenize(str(sentence))):
            if (pos == 'NN' or pos == 'NNP' or pos == 'NNS' or pos == 'NNPS' or pos == 'PRP'):
                nouns = word
                s = 1
                end_index = sentence.find(word)+len(word)
            elif s == 1:
                end_index += len(word)+1
                if sentence[-1] == '.':
                   sentence = sentence[:-1]
                if sentence[-3:] == 'and':
                   sentence = sentence[:-3]
                sentence = sentence[end_index:].strip()
                list.append(sentence)
                i+=1
                break
    print(list)
    return list
