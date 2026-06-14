/**
 * Lightweight TF-IDF and Cosine Similarity Engine
 * Used for ML-based Recommendations without heavy dependencies.
 */

// Basic tokenizer: lowercase and extract words
function tokenize(text) {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 1);
  }
  
  // Calculate Term Frequency (TF) for a document
  function calculateTF(tokens) {
    const tf = {};
    const totalTerms = tokens.length;
    if (totalTerms === 0) return tf;
  
    tokens.forEach((token) => {
      tf[token] = (tf[token] || 0) + 1;
    });
  
    // Normalize TF
    for (let term in tf) {
      tf[term] = tf[term] / totalTerms;
    }
    return tf;
  }
  
  // Calculate Inverse Document Frequency (IDF) for a corpus
  function calculateIDF(corpusTokensList) {
    const idf = {};
    const totalDocs = corpusTokensList.length;
  
    // Count documents containing each term
    const docCount = {};
    corpusTokensList.forEach((tokens) => {
      const uniqueTokens = new Set(tokens);
      uniqueTokens.forEach((token) => {
        docCount[token] = (docCount[token] || 0) + 1;
      });
    });
  
    // Calculate IDF
    for (let term in docCount) {
      // Add 1 to avoid division by zero and smooth the curve
      idf[term] = Math.log(totalDocs / (1 + docCount[term]));
    }
  
    return idf;
  }
  
  // Compute TF-IDF vector for a document
  function computeTFIDFVector(tf, idf, vocabulary) {
    const vector = [];
    vocabulary.forEach((term) => {
      const termTF = tf[term] || 0;
      const termIDF = idf[term] || 0;
      vector.push(termTF * termIDF);
    });
    return vector;
  }
  
  // Compute Cosine Similarity between two vectors
  function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
  
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
  
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
  
  /**
   * Main recommendation function.
   * @param {Object} targetDoc - { id, text } representing the user
   * @param {Array} candidateDocs - Array of { id, text, originalObject }
   * @returns {Array} - Candidates sorted by similarity score
   */
  function rankCandidates(targetDoc, candidateDocs) {
    if (!targetDoc || !targetDoc.text || candidateDocs.length === 0) return [];
  
    const allDocs = [targetDoc, ...candidateDocs];
    const corpusTokensList = allDocs.map((doc) => tokenize(doc.text));
  
    // 1. Build Vocabulary and IDF
    const idf = calculateIDF(corpusTokensList);
    const vocabulary = Object.keys(idf);
  
    // 2. Compute vectors
    const tfList = corpusTokensList.map(calculateTF);
    const vectors = tfList.map((tf) => computeTFIDFVector(tf, idf, vocabulary));
  
    // Target is index 0
    const targetVector = vectors[0];
  
    // 3. Score Candidates (index 1 to N)
    const results = candidateDocs.map((candidate, index) => {
      const candidateVector = vectors[index + 1];
      const score = cosineSimilarity(targetVector, candidateVector);
      return {
        ...candidate.originalObject,
        mlScore: score,
        matchPercentage: Math.round(score * 100),
      };
    });
  
    // 4. Sort descending
    return results.sort((a, b) => b.mlScore - a.mlScore);
  }
  
  module.exports = {
    tokenize,
    rankCandidates,
    cosineSimilarity,
  };
  
