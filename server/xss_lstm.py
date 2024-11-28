import pandas as pd
from tensorflow.keras.preprocessing.text import Tokenizer
from keras.preprocessing.sequence import pad_sequences
from keras.utils import to_categorical
from keras.models import Sequential
from keras.layers import Embedding, Dense, Dropout

df = pd.read_csv('XSS_dataset.csv')

train_text, val_text, train_labels, val_labels = train_test_split(df['Sentence'], df['Label'], test_size=0.2, random_state=42)

tokenizer = Tokenizer(num_words=5000)
tokenizer.fit_on_texts(train_text)

train_sequences = tokenizer.texts_to_sequences(train_text)
val_sequences = tokenizer.texts_to_sequences(val_text)

max_length = 100
padded_train = pad_sequences(train_sequences, maxlen=max_length)
padded_val = pad_sequences(val_sequences, maxlen=max_length)

num_classes = 2
train_labels_onehot = to_categorical(train_labels, num_classes)
val_labels_onehot = to_categorical(val_labels, num_classes)

from keras.layers import LSTM, BatchNormalization

model = Sequential()
model.add(Embedding(input_dim=5000, output_dim=128, input_length=max_length))

model.add(LSTM(128, return_sequences=True))  
model.add(Dropout(0.2))

model.add(LSTM(64, return_sequences=False))  
model.add(Dropout(0.2))

model.add(BatchNormalization())

model.add(Dense(64, activation='relu'))  
model.add(Dropout(0.2))

model.add(Dense(num_classes, activation='softmax'))  

model.compile(loss='sparse_categorical_crossentropy', optimizer='adam', metrics=['accuracy'])

model.fit(padded_train, train_labels, epochs=10, batch_size=32, validation_data=(padded_val, val_labels))

loss, accuracy = model.evaluate(padded_val, val_labels)
print(f'Validation accuracy: {accuracy:.3f}')
sample_sentence = '<tt onmouseover="alert(1)">test</tt>'
sample_sequence = tokenizer.texts_to_sequences([sample_sentence])
padded_sample = pad_sequences(sample_sequence, maxlen=max_length)

prediction = model.predict(padded_sample)
print(f'Prediction: {np.argmax(prediction)}')